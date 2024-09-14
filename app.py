from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import base64
from flask import send_from_directory

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'church_members.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'  # 실제 운영 환경에서는 안전한 비밀키를 사용해야 합니다

db = SQLAlchemy(app)
migrate = Migrate(app, db)

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
            'position': self.position
        }

# 새로운 User 모델 추가
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    members = Member.query.all()
    return render_template('index.html', members=members)

@app.route('/member/new', methods=['GET', 'POST'])
def new_member():
    if request.method == 'POST':
        # POST 요청 처리 (새 회원 생성)
        new_member = Member(
            name=request.form['name'],
            register_date=datetime.strptime(request.form['register_date'], '%Y-%m-%d').date(),
            birth_year=int(request.form['birth_year']),
            birth_month=int(request.form['birth_month']),
            birth_day=int(request.form['birth_day']),
            phone=request.form['phone'],
            gender=request.form['gender'],
            # 나머지 필드들도 같은 방식으로 추가
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
        # POST 요청 처리 (회원 정보 업데이트)
        member.name = request.form['name']
        member.register_date = datetime.strptime(request.form['register_date'], '%Y-%m-%d').date()
        member.birth_year = int(request.form['birth_year'])
        member.birth_month = int(request.form['birth_month'])
        member.birth_day = int(request.form['birth_day'])
        member.phone = request.form['phone']
        member.gender = request.form['gender']
        # 나머지 필드들도 같은 방식으로 업데이트
        db.session.commit()
        return redirect(url_for('view_member', id=member.id))
    return render_template('edit_member.html', member=member)

@app.route('/member/<int:id>/delete', methods=['POST'])
def delete_member(id):
    member = Member.query.get_or_404(id)
    db.session.delete(member)
    db.session.commit()
    return redirect(url_for('index'))

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

    # 필터링
    for field in ['gender', 'district', 'position']:
        value = request.args.get(field)
        if value:
            query = query.filter(getattr(Member, field) == value)

    # 정렬
    sort_by = request.args.get('sort_by', 'name')
    sort_order = request.args.get('sort_order', 'asc')
    if sort_order == 'desc':
        query = query.order_by(desc(getattr(Member, sort_by)))
    else:
        query = query.order_by(getattr(Member, sort_by))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    members = pagination.items

    return jsonify({
        'members': [member.to_dict() for member in members],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

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
        new_member = Member(
            name=data['name'],
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
        session['user_id'] = user.id
        return jsonify({"message": "로그인 성공", "user_id": user.id}), 200
    
    return jsonify({"message": "이메일 또는 비밀번호가 잘못되었습니다"}), 401

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
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

@app.route('/api/members/<int:id>', methods=['PUT'])
def update_member(id):
    member = Member.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        if key == 'photo' and value:
            # Base64 이미지 데이터를 파일로 저장
            image_data = base64.b64decode(value)
            filename = f"member_{id}_photo.jpg"
            with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'wb') as f:
                f.write(image_data)
            setattr(member, key, filename)
        else:
            setattr(member, key, value)
    db.session.commit()
    return jsonify({"message": "회원 정보가 성공적으로 수정되었습니다."})

# 정적 파일 서빙을 위한 라우트 추가
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)