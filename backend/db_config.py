from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables
POSTGRES_URL = os.getenv("POSTGRES_URL")
if not POSTGRES_URL:
    raise EnvironmentError("POSTGRES_URL environment variable not set.")

# Create SQLAlchemy engine with SSL requirements for Vercel Postgres
engine = create_engine(
    POSTGRES_URL,
    pool_size=10,  # Adjust based on your needs
    max_overflow=20,
    pool_pre_ping=True,  # Enable connection health checks
    pool_recycle=300,  # Recycle connections every 5 minutes
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

# Function to test database connection
def test_connection():
    try:
        with engine.connect() as connection:
            print("Successfully connected to the database!")
            return True
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return False

if __name__ == "__main__":
    test_connection()