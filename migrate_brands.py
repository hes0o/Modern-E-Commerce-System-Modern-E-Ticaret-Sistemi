import logging
from sqlalchemy import text
from app.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    logger.info("Starting brand table migration...")
    
    with engine.begin() as conn:
        # Check if category_id column already exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='brands' AND column_name='category_id';
        """)
        result = conn.execute(check_query).fetchone()
        
        if not result:
            logger.info("Adding category_id column to brands table...")
            conn.execute(text("ALTER TABLE brands ADD COLUMN category_id INTEGER;"))
            
            logger.info("Adding foreign key constraint...")
            conn.execute(text("""
                ALTER TABLE brands 
                ADD CONSTRAINT fk_brands_category_id 
                FOREIGN KEY (category_id) REFERENCES categories(id) 
                ON DELETE SET NULL;
            """))
            logger.info("Migration completed successfully.")
        else:
            logger.info("category_id column already exists. Skipping migration.")

if __name__ == "__main__":
    run_migration()
