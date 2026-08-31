from sqlalchemy.orm import Session

from app.models import Technology

DEFAULT_TECHNOLOGIES = [
    ("Python", "backend"),
    ("JavaScript", "frontend"),
    ("TypeScript", "frontend"),
    ("FastAPI", "backend"),
    ("Django", "backend"),
    ("Flask", "backend"),
    ("React", "frontend"),
    ("Vue.js", "frontend"),
    ("Next.js", "frontend"),
    ("Node.js", "backend"),
    ("PostgreSQL", "database"),
    ("MySQL", "database"),
    ("SQLite", "database"),
    ("MongoDB", "database"),
    ("Redis", "database"),
    ("Docker", "devops"),
    ("Kubernetes", "devops"),
    ("Git", "devops"),
    ("HTML/CSS", "frontend"),
    ("Tailwind CSS", "frontend"),
    ("GraphQL", "backend"),
    ("SQLAlchemy", "backend"),
    ("Telegram Bot API", "other"),
    ("OpenAI API", "other"),
    ("Figma", "design"),
]


def seed_technologies(db: Session) -> None:
    """Idempotently insert default technologies on startup."""
    existing = {name for (name,) in db.execute(Technology.__table__.select().with_only_columns(Technology.name)).all()}
    from app.utils.slug import slugify

    for name, category in DEFAULT_TECHNOLOGIES:
        if name not in existing:
            db.add(Technology(name=name, slug=slugify(name), category=category))
    db.commit()
