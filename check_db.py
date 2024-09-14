from app import app, db
from sqlalchemy import inspect

def check_db_structure():
    with app.app_context():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print("Database Tables:")
        for table in tables:
            print(f"\nTable: {table}")
            columns = inspector.get_columns(table)
            for column in columns:
                print(f"  - {column['name']}: {column['type']}")

if __name__ == "__main__":
    check_db_structure()