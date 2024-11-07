from sqlalchemy import Column, String, DateTime, func
from db_config import Base
import uuid

class GeneratedImage(Base):
    __tablename__ = "generated_images"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt_id = Column(String, nullable=False)
    image_url = Column(String)
    thumbnail_url = Column(String)
    generation_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<GeneratedImage(id={self.id}, prompt_id={self.prompt_id}, status={self.generation_status})>"