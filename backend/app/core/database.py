from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2
from app.core.config import settings

# Try PostgreSQL first, fallback to SQLite
try:
    engine = create_engine(settings.DATABASE_URL)
    # Test the connection
    with engine.connect() as conn:
        conn.execute("SELECT 1")
    print("Connected to PostgreSQL database")
except Exception as e:
    print(f"PostgreSQL connection failed: {e}")
    print("Falling back to SQLite database")
    engine = create_engine(settings.SQLITE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Import all models here
from app.models.chat import Conversation, Message

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
