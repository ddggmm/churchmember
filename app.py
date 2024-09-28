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
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token, jwt_refresh_token_required, get_jti, get_jwt
import re
import redis
from dotenv import load_dotenv

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
jwt_redis_blocklist = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)

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

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
                return jsonify({"error": "관리자 권한이 필요합니다."}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def super_admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role != UserRole.SUPER_ADMIN:
                return jsonify({"error": "최고 관리자 권한이 필요합니다."}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

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
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        response = make_response(jsonify({
            'user': user.to_dict(),
            'message': '로그인 성공'
        }))
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Lax')
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Lax')
        return response, 200
    
    return jsonify({"message": "이메일 또는 비밀��호가 잘못되었습니다"}), 401

def is_password_valid(password):
    return len(password) >= 8 and any(c.isdigit() for c in password) and any(c.isalpha() for c in password)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not is_password_valid(password):
        return error_response("비밀번호는 8자 이상이며, 숫자와 문자를 모두 포함해야 합니다.", 400)
    
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
    member = Member.query.get_or_404(id)
    data = request.json
    
    if 'email' in data:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return error_response("유효한 이메일 주소를 입력해주세요.", 400)

    if 'email' in data and data['email'] != member.email:
        if Member.query.filter_by(email=data['email']).first():
            return error_response("이미 사용 중인 이메일 주소입니다.", 400)

    for key, value in data.items():
        if key == 'photo' and value:
            image_data = base64.b64decode(value)
            filename = f"member_{id}_photo.jpg"
            with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'wb') as f:
                f.write(image_data)
            setattr(member, key, filename)
        else:
            setattr(member, key, value)
    db.session.commit()
    return jsonify({"message": "회원 정보가 성공적으로 수정되었습니다."})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/members/<int:id>', methods=['DELETE'])
def delete_member(id):
    try:
        member = Member.query.get(id)
        if not member:
            return jsonify({"error": "회원을 찾을 수 없습니다."}), 404
        
        db.session.delete(member)
        db.session.commit()
        return jsonify({"message": "회원이 성공적으로 삭제되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

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
    response = make_response(jsonify({"message": "로그아웃 성공"}))
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
@jwt_refresh_token_required
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_token}), 200

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

if __name__ == '__main__':
    create_super_admin()
    app.run(port=5001)