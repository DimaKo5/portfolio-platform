import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, utcnow

STATUS_DRAFT = "DRAFT"
STATUS_PUBLISHED = "PUBLISHED"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), index=True)
    short_description: Mapped[str | None] = mapped_column(String(300))
    problem: Mapped[str | None] = mapped_column(Text)
    solution: Mapped[str | None] = mapped_column(Text)
    features: Mapped[str | None] = mapped_column(Text)
    result: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str | None] = mapped_column(String(120))
    cover_image_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(500))
    live_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(16), default=STATUS_DRAFT, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="projects")  # noqa: F821
    technologies: Mapped[list["Technology"]] = relationship(  # noqa: F821
        secondary="project_technologies", lazy="selectin"
    )
    images: Mapped[list["ProjectImage"]] = relationship(  # noqa: F821
        back_populates="project", cascade="all, delete-orphan", order_by="ProjectImage.sort_order"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "slug", name="uq_project_user_slug"),
    )


