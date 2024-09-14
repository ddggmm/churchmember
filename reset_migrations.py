import os
import shutil
import subprocess

def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output, error = process.communicate()
    if process.returncode != 0:
        print(f"Error executing command: {command}")
        print(f"Error message: {error.decode('utf-8')}")
    else:
        print(f"Command executed successfully: {command}")
        print(f"Output: {output.decode('utf-8')}")

# 프로젝트 루트 디렉토리 설정
basedir = os.path.abspath(os.path.dirname(__file__))

# instance 폴더 확인
instance_dir = os.path.join(basedir, 'instance')
if not os.path.exists(instance_dir):
    os.makedirs(instance_dir)
    print(f"Created instance directory: {instance_dir}")
else:
    print(f"Instance directory already exists: {instance_dir}")

# 데이터베이스 파일 경로 설정
db_path = os.path.join(instance_dir, 'church_members.db')

# 데이터베이스 파일 삭제
if os.path.exists(db_path):
    print(f"기존 데이터베이스 파일을 삭제합니다: {db_path}")
    os.remove(db_path)
else:
    print("데이터베이스 파일이 존재하지 않습니다.")

# migrations 폴더 삭제
migrations_dir = os.path.join(basedir, 'migrations')
if os.path.exists(migrations_dir):
    print("migrations 폴더를 삭제합니다.")
    shutil.rmtree(migrations_dir)
else:
    print("migrations 폴더가 존재하지 않습니다.")

# 마이그레이션 초기화
print("마이그레이션을 초기화합니다.")
run_command("flask db init")

# 새 마이그레이션 생성
print("새 마이그레이션을 생성합니다.")
run_command("flask db migrate -m 'Initial migration'")

# 마이그레이션 적용
print("마이그레이션을 적용합니다.")
run_command("flask db upgrade")

print("모든 작업이 완료되었습니다.")

# 데이터베이스 파일 생성 확인
if os.path.exists(db_path):
    print(f"데이터베이스 파일이 성공적으로 생성되었습니다: {db_path}")
else:
    print(f"오류: 데이터베이스 파일이 생성되지 않았습니다: {db_path}")