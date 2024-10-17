from flask import Flask, render_template, request, redirect, url_for, jsonify, session, abort, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import base64
from flask import send_from_directory
from enum import Enum
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token, get_jwt
import re
import redis
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pandas as pd
from io import StringIO
from redis.exceptions import ConnectionError

load_dotenv()

class UserRole(Enum):
    USER = 'USER'
    ADMIN = 'ADMIN'
    SUPER_ADMIN = 'SUPER_ADMIN'

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# 토큰 블랙리스트를 위한 Redis 설정 (또는 다른 저장소 사용)
try:
    jwt_redis_blocklist = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)
    jwt_redis_blocklist.ping()  # Redis 연결 테스트
    print("Redis 연결 성공")
except ConnectionError:
    print("Redis 연결에 실패했습니다. Redis 서버가 실행 중인지 확인하세요.")
    # 대체 로직 또는 애플리케이션 종료 처리

# Limiter 설정
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Member 모델 정의
class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    register_date = db.Column(db.Date, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    birth_year = db.Column(db.Integer, nullable=False)
    birth_month = db.Column(db.Integer, nullable=False)
    birth_day = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(100))
    city = db.Column(db.String(50))
    state = db.Column(db.String(2))
    zipcode = db.Column(db.String(10))
    district = db.Column(db.String(50))
    photo = db.Column(db.String(255))
    password_hash = db.Column(db.String(128))
    gender = db.Column(db.String(10))
    spouse = db.Column(db.String(50))
    position = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default='회원')  # '최고 관리자', '당회 및 교역자', '구역장', '회원', '비회원'
    is_active = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'birthYear': self.birth_year,
            'birthMonth': self.birth_month,
            'birthDay': self.birth_day,
            'phone': self.phone,
            'gender': self.gender,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zipcode': self.zipcode,
            'district': self.district,
            'spouse': self.spouse,
            'position': self.position,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# User 모델 정의
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role.value  # Enum 값을 문자열로 반환
        }

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return jsonify({"error": "관리자 권한이 필요합니다."}), 403
        return f(*args, **kwargs)
    return decorated

def super_admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != UserRole.SUPER_ADMIN:
            return jsonify({"error": "최고 관리자 권한이 필요합니다."}), 403
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def index():
    members = Member.query.all()
    return render_template('index.html', members=members)

@app.route('/member/new', methods=['GET', 'POST'])
def new_member():
    if request.method == 'POST':
        new_member = Member(
            name=request.form['name'],
            register_date=datetime.strptime(request.form['register_date'], '%Y-%m-%d').date(),
            birth_year=int(request.form['birth_year']),
            birth_month=int(request.form['birth_month']),
            birth_day=int(request.form['birth_day']),
            phone=request.form['phone'],
            gender=request.form['gender'],
        )
        db.session.add(new_member)
        db.session.commit()
        return redirect(url_for('index'))
    return render_template('new_member.html')

@app.route('/member/<int:id>')
def view_member(id):
    member = Member.query.get_or_404(id)
    return render_template('view_member.html', member=member)

@app.route('/member/<int:id>/edit', methods=['GET', 'POST'])
def edit_member(id):
    member = Member.query.get_or_404(id)
    if request.method == 'POST':
        member.name = request.form['name']
        member.register_date = datetime.strptime(request.form['register_date'], '%Y-%m-%d').date()
        member.birth_year = int(request.form['birth_year'])
        member.birth_month = int(request.form['birth_month'])
        member.birth_day = int(request.form['birth_day'])
        member.phone = request.form['phone']
        member.gender = request.form['gender']
        db.session.commit()
        return redirect(url_for('view_member', id=member.id))
    return render_template('edit_member.html', member=member)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'filename': filename}), 200
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/members', methods=['GET'])
def get_members():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    query = Member.query

    for field in ['gender', 'district', 'position']:
        value = request.args.get(field)
        if value:
            query = query.filter(getattr(Member, field) == value)

    sort_by = request.args.get('sort_by', 'name')
    sort_order = request.args.get('sort_order', 'asc')
    if sort_order == 'desc':
        query = query.order_by(db.desc(getattr(Member, sort_by)))
    else:
        query = query.order_by(getattr(Member, sort_by))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    members = pagination.items

    return jsonify({
        'members': [{
            **member.to_dict(),
            'photoUrl': url_for('uploaded_file', filename=member.photo, _external=True) if member.photo else None
        } for member in members],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/members/public', methods=['GET'])
def get_public_members():
    try:
        name = request.args.get('name', '')
        members = Member.query.filter(Member.name.like(f'%{name}%')).all()
        return jsonify([
            {
                'id': member.id,
                'name': member.name,
                'spouse': member.spouse,
                'photoUrl': url_for('uploaded_file', filename=member.photo, _external=True) if member.photo else None
            } for member in members
        ])
    except Exception as e:
        print(f"Error in get_public_members: {str(e)}")  # 서버 콘솔에 에러 로깅
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/members/<int:id>', methods=['GET'])
def get_member(id):
    member = Member.query.get_or_404(id)
    member_dict = member.to_dict()
    if member.photo:
        member_dict['photoUrl'] = url_for('uploaded_file', filename=member.photo, _external=True)
    return jsonify(member_dict)

@app.route('/api/members', methods=['POST', 'OPTIONS'])
def create_member():
    data = request.json
    try:
        email = data.get('email')
        if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"error": "유효한 이메일 주소를 입력해주세요."}), 400

        if Member.query.filter_by(email=email).first():
            return jsonify({"error": "이미 사용 중인 이메일 주소입니다."}), 400

        new_member = Member(
            name=data['name'],
            email=email,
            register_date=datetime.now().date(),
            birth_year=int(data['birthYear']),
            birth_month=int(data['birthMonth']),
            birth_day=int(data['birthDay']),
            phone=data['phone'],
            gender=data['gender'],
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zipcode=data.get('zipcode'),
            district=data.get('district'),
            spouse=data.get('spouse'),
            position=data.get('position')
        )
        if 'photo' in data:
            filename = f"member_{datetime.now().timestamp()}.jpg"
            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with open(photo_path, "wb") as fh:
                fh.write(base64.b64decode(data['photo']))
            new_member.photo = filename

        db.session.add(new_member)
        db.session.commit()
        return jsonify({"message": "회원이 성공적으로 등록되었습니다."}), 201
    except KeyError as e:
        return jsonify({"error": f"필수 필드가 누락되었습니다: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"회원 등록 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'message': '로그인 성공'
        }), 200
    
    return jsonify({"message": "이메일 또는 비밀번호가 잘못되었습니다"}), 401

def is_password_strong(password, strict=False):
    """
    비밀번호 강도를 확인하는 함수
    - strict 모드: 새 정책 (12자 이상)
    - 비 strict 모드: 기존 정책 (10자 이상)
    """
    min_length = 12 if strict else 10
    if len(password) < min_length:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if strict and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

@app.route('/api/auth/signup', methods=['POST'])
@limiter.limit("3 per hour")
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not is_password_strong(password):
        return error_response("비밀번호는 최소 12자 이상이며, 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.", 400)
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "이미 존재하는 이메일입니다"}), 400
    
    new_user = User(email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "회원가입 성공"}), 201

@app.route('/api/members/search', methods=['GET'])
def search_members():
    name = request.args.get('name')
    members = Member.query.filter(Member.name.like(f'%{name}%')).all()
    return jsonify([
        {
            'id': member.id,
            'name': member.name,
            'phone': member.phone,
            'gender': member.gender,
            'spouse': member.spouse
        } for member in members
    ])

def error_response(message, status_code):
    response = jsonify({"error": message})
    response.status_code = status_code
    return response

@app.route('/api/members/<int:id>', methods=['PUT'])
@jwt_required()
def update_member(id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            return jsonify({"message": "권한이 없습니다."}), 403
        
        member = Member.query.get_or_404(id)
        data = request.json  # JSON 데이터 사용
        
        for key, value in data.items():
            if hasattr(member, key):
                setattr(member, key, value)
        
        db.session.commit()
        return jsonify({"message": "회원 정보가 업데이트되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"회원 정보 업데이트 중 오류 발생: {str(e)}")
        return jsonify({"error": "회원 정보 업데이트 중 오류가 발생했습니다."}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/members/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_member(id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    if not user or user.role not in ['ADMIN', 'SUPER_ADMIN']:
        return jsonify({"message": "권한이 없습니다."}), 403
    
    member = Member.query.get_or_404(id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": "회원이 삭제되었습니다."}), 200

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    try:
        users = User.query.all()
        app.logger.info(f"Retrieved {len(users)} users")
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        app.logger.error(f"Error in get_all_users: {str(e)}")
        return jsonify({"error": "사용자 목록을 불러오는 중 오류가 발생했습니다."}), 500

@app.route('/api/admin/users', methods=['POST'])
@jwt_required()
@super_admin_required
def create_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({"error": "이메일, 비밀번호, 역할은 필수입니다."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "이미 존재하는 이메일입니다."}), 400

    if role not in [r.name for r in UserRole]:
        return jsonify({"error": "유효하지 않은 역할입니다."}), 400

    new_user = User(email=email, role=UserRole[role])
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@super_admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    if 'email' in data:
        user.email = data['email']
    if 'role' in data:
        if data['role'] not in [r.name for r in UserRole]:
            return jsonify({"error": "유효하지 않은 역할입니다."}), 400
        user.role = UserRole[data['role']]
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.to_dict()), 200

@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@super_admin_required
def update_user_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    if 'role' in data and data['role'] in UserRole.__members__:
        user.role = UserRole[data['role']]
        db.session.commit()
        return jsonify(user.to_dict()), 200
    return jsonify({"error": "Invalid role"}), 400

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    jwt_redis_blocklist.set(jti, '', ex=3600)
    response = make_response(jsonify({"message": "그아웃 성공"}))
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response, 200

@app.route('/api/auth/check', methods=['GET'])
@jwt_required(optional=True)
def check_auth():
    current_user_id = get_jwt_identity()
    if current_user_id:
        user = User.query.get(current_user_id)
        if user:
            return jsonify({
                "isLoggedIn": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role.value
                }
            }), 200
    return jsonify({"isLoggedIn": False}), 200

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@super_admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

def create_super_admin():
    with app.app_context():
        super_admin_email = os.getenv('SUPER_ADMIN_EMAIL')
        super_admin_password = os.getenv('SUPER_ADMIN_PASSWORD')
        super_admin = User.query.filter_by(email=super_admin_email).first()
        if not super_admin:
            super_admin = User(email=super_admin_email, role=UserRole.SUPER_ADMIN)
            super_admin.set_password(super_admin_password)
            db.session.add(super_admin)
        else:
            super_admin.role = UserRole.SUPER_ADMIN
        db.session.commit()
        print(f"Super admin {super_admin_email} has been created or updated.")

@app.cli.command("update_null_emails")
def update_null_emails():
    members = Member.query.filter(Member.email == None).all()
    for member in members:
        member.email = f"unknown_{member.id}@example.com"
    db.session.commit()
    print(f"Updated {len(members)} members with null emails.")

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200

# JWT 설정에 토큰 확인 콜백 추가
@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token_in_redis = jwt_redis_blocklist.get(jti)
    return token_in_redis is not None

@app.errorhandler(404)
def not_found_error(error):
    return error_response("요청한 리소스를 찾을 수 없습니다.", 404)

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return error_response("서버 내부 오류가 발생했습니다.", 500)

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

@app.route('/api/import-db', methods=['POST'])
@jwt_required()
@super_admin_required
def import_db():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.csv'):
        try:
            # CSV 파일 읽기
            stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
            df = pd.read_csv(stream)
            
            # 데이터베이스에 데이터 삽입 또는 업데이트
            for _, row in df.iterrows():
                member = Member.query.filter_by(email=row['email']).first()
                if member:
                    # 기존 회원 정보 업데이트
                    for column in df.columns:
                        setattr(member, column, row[column])
                else:
                    # 새 회원 추가
                    new_member = Member(**row.to_dict())
                    db.session.add(new_member)
            
            db.session.commit()
            return jsonify({'message': 'Database imported successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/members/<int:id>/photo', methods=['PUT'])
@jwt_required()
def update_member_photo(id):
    if 'photo' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        member = Member.query.get_or_404(id)
        member.photoUrl = filename
        db.session.commit()
        return jsonify({"message": "Photo updated successfully"}), 200
    return jsonify({"message": "File type not allowed"}), 400

if __name__ == '__main__':
    create_super_admin()
    app.run(port=5001)