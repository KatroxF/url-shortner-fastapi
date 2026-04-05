from dotenv import load_dotenv
import os

BASE_DIR=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv(os.path.join(BASE_DIR,".env"))

SQLALCHEMY_DATABASE_URL=os.getenv("SQLALCHEMY_DATABASE_URL")