"""
Seed demo products, categories, and brands into the database.
Run: python seed_products.py
"""
from sqlmodel import Session, select
from app.database import engine
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product, ProductVariant


CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "description": "Gadgets and devices"},
    {"name": "Clothing", "slug": "clothing", "description": "Fashion and apparel"},
    {"name": "Home & Garden", "slug": "home-garden", "description": "Home decor and garden"},
    {"name": "Sports", "slug": "sports", "description": "Sports and outdoor gear"},
    {"name": "Books", "slug": "books", "description": "Books and education"},
]

BRANDS = [
    {"name": "TechPro"},
    {"name": "StyleHub"},
    {"name": "HomeEssentials"},
    {"name": "SportZone"},
]

PRODUCTS = [
    # Electronics
    {"name": "Wireless Noise-Cancelling Headphones", "sku": "TECH-001", "slug": "wireless-nc-headphones",
     "price": 1299.99, "category": "Electronics", "brand": "TechPro", "stock": 45,
     "short_description": "Premium audio with 30hr battery life", "is_new": True, "is_featured": True,
     "long_description": "Experience crystal-clear audio with our latest wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort padding.", "vat_rate": 20},
    {"name": "Smart 4K OLED TV 55\"", "sku": "TECH-002", "slug": "smart-4k-oled-tv-55",
     "price": 8499.00, "discount_price": 6999.00, "category": "Electronics", "brand": "TechPro", "stock": 12,
     "short_description": "Stunning 4K OLED display with smart features", "is_bestseller": True,
     "long_description": "Immerse yourself in breathtaking visuals with our 55-inch 4K OLED TV. Features Dolby Vision, built-in streaming, and voice control.", "vat_rate": 20},
    {"name": "Gaming Mechanical Keyboard RGB", "sku": "TECH-003", "slug": "gaming-mech-keyboard-rgb",
     "price": 649.99, "category": "Electronics", "brand": "TechPro", "stock": 78,
     "short_description": "Full RGB mechanical keyboard with Cherry MX switches", "is_new": True,
     "long_description": "Dominate your games with per-key RGB lighting, tactile Cherry MX Blue switches, and an aircraft-grade aluminium frame.", "vat_rate": 20},
    {"name": "Wireless Charging Pad Qi", "sku": "TECH-004", "slug": "wireless-charging-pad-qi",
     "price": 299.00, "discount_price": 199.00, "category": "Electronics", "brand": "TechPro", "stock": 120,
     "short_description": "Fast 15W Qi wireless charger", "is_campaign": True,
     "long_description": "Charge your devices up to 15W wirelessly. Compatible with all Qi-enabled devices. Slim, lightweight design.", "vat_rate": 20},
    {"name": "Portable Bluetooth Speaker 360°", "sku": "TECH-005", "slug": "portable-bluetooth-speaker",
     "price": 799.00, "category": "Electronics", "brand": "TechPro", "stock": 60,
     "short_description": "360° surround sound, waterproof IPX6", "is_featured": True,
     "long_description": "Take the party anywhere with our waterproof Bluetooth speaker. IPX6 rated, 20-hour battery, and 360-degree surround sound.", "vat_rate": 20},
    # Clothing
    {"name": "Premium Cotton Hoodie", "sku": "CLTH-001", "slug": "premium-cotton-hoodie",
     "price": 449.00, "category": "Clothing", "brand": "StyleHub", "stock": 200,
     "short_description": "100% organic cotton, unisex fit", "is_new": True,
     "long_description": "Crafted from 100% organic cotton, this hoodie offers unmatched softness and durability. Available in multiple sizes.", "vat_rate": 20},
    {"name": "Slim Fit Chino Pants", "sku": "CLTH-002", "slug": "slim-fit-chino-pants",
     "price": 349.00, "discount_price": 279.00, "category": "Clothing", "brand": "StyleHub", "stock": 150,
     "short_description": "Modern slim fit, stretch fabric", "is_bestseller": True,
     "long_description": "Look sharp and feel comfortable in our slim-fit chinos. Made from stretch fabric with a modern tapered cut.", "vat_rate": 20},
    {"name": "Leather Sneakers Classic White", "sku": "CLTH-003", "slug": "leather-sneakers-classic-white",
     "price": 899.00, "category": "Clothing", "brand": "StyleHub", "stock": 85,
     "short_description": "Timeless leather sneakers, premium finish", "is_featured": True,
     "long_description": "These iconic white leather sneakers pair with everything. Premium full-grain leather upper, cushioned insole.", "vat_rate": 20},
    # Home
    {"name": "Ergonomic Office Chair", "sku": "HOME-001", "slug": "ergonomic-office-chair",
     "price": 2499.00, "discount_price": 1999.00, "category": "Home & Garden", "brand": "HomeEssentials", "stock": 25,
     "short_description": "Lumbar support, adjustable armrests", "is_bestseller": True,
     "long_description": "Work in comfort all day long. Features adjustable lumbar support, breathable mesh back, and 4D armrests.", "vat_rate": 20},
    {"name": "Stainless Steel Cookware Set 10pc", "sku": "HOME-002", "slug": "stainless-steel-cookware-set",
     "price": 1199.00, "category": "Home & Garden", "brand": "HomeEssentials", "stock": 40,
     "short_description": "Tri-ply stainless, dishwasher safe", "is_new": True, "is_campaign": True,
     "long_description": "Professional-grade tri-ply stainless steel cookware set. Even heat distribution, oven-safe up to 260°C, dishwasher safe.", "vat_rate": 20},
    {"name": "Smart LED Desk Lamp", "sku": "HOME-003", "slug": "smart-led-desk-lamp",
     "price": 399.00, "category": "Home & Garden", "brand": "HomeEssentials", "stock": 95,
     "short_description": "USB-C charging, touch dimmer, 5 colour modes", "is_featured": True,
     "long_description": "Illuminate your workspace perfectly. Features 5 colour temperature modes, touch dimmer, and built-in USB-C charging port.", "vat_rate": 20},
    # Sports
    {"name": "Yoga Mat Premium Non-Slip", "sku": "SPRT-001", "slug": "yoga-mat-premium-non-slip",
     "price": 299.00, "category": "Sports", "brand": "SportZone", "stock": 180,
     "short_description": "6mm thick, eco-friendly TPE material", "is_new": True,
     "long_description": "Take your practice to the next level with our premium non-slip yoga mat. 6mm thickness for joint protection, eco-friendly TPE material.", "vat_rate": 20},
    {"name": "Adjustable Dumbbell Set 20kg", "sku": "SPRT-002", "slug": "adjustable-dumbbell-set-20kg",
     "price": 1499.00, "discount_price": 1199.00, "category": "Sports", "brand": "SportZone", "stock": 30,
     "short_description": "Space-saving, quick-adjust mechanism", "is_bestseller": True,
     "long_description": "Replace an entire rack of weights with one compact set. Adjusts from 2-20kg in seconds with the innovative quick-lock system.", "vat_rate": 20},
    {"name": "Running Shoes UltraBoost", "sku": "SPRT-003", "slug": "running-shoes-ultraboost",
     "price": 1299.00, "category": "Sports", "brand": "SportZone", "stock": 65,
     "short_description": "Energy-return foam, breathable mesh", "is_featured": True,
     "long_description": "Every stride feels effortless. Our energy-return foam cushioning and breathable engineered mesh keep you going mile after mile.", "vat_rate": 20},
    # Books
    {"name": "The Art of Clean Code", "sku": "BOOK-001", "slug": "the-art-of-clean-code",
     "price": 149.00, "category": "Books", "brand": "TechPro", "stock": 300,
     "short_description": "Best practices for software developers", "is_new": True,
     "long_description": "A comprehensive guide to writing clean, maintainable code. Covers principles, patterns, and practices used by elite software engineers.", "vat_rate": 8},
    {"name": "Entrepreneurship & Innovation", "sku": "BOOK-002", "slug": "entrepreneurship-and-innovation",
     "price": 129.00, "category": "Books", "brand": "TechPro", "stock": 200,
     "short_description": "From idea to successful business", "is_bestseller": True,
     "long_description": "Learn how the world's most successful entrepreneurs turned simple ideas into billion-dollar businesses. Practical advice and inspiring stories.", "vat_rate": 8},
]

def seed():
    with Session(engine) as session:
        # Seed categories
        cat_map = {}
        for cat_data in CATEGORIES:
            existing = session.exec(select(Category).where(Category.slug == cat_data["slug"])).first()
            if existing:
                cat_map[cat_data["name"]] = existing.id
                print(f"  ✓ Category exists: {cat_data['name']}")
            else:
                cat = Category(**cat_data)
                session.add(cat)
                session.flush()
                cat_map[cat_data["name"]] = cat.id
                print(f"  + Category created: {cat_data['name']}")

        # Seed brands
        brand_map = {}
        for brand_data in BRANDS:
            existing = session.exec(select(Brand).where(Brand.name == brand_data["name"])).first()
            if existing:
                brand_map[brand_data["name"]] = existing.id
            else:
                brand = Brand(name=brand_data["name"])
                session.add(brand)
                session.flush()
                brand_map[brand_data["name"]] = brand.id
                print(f"  + Brand created: {brand_data['name']}")

        # Seed products
        for p in PRODUCTS:
            existing = session.exec(select(Product).where(Product.sku == p["sku"])).first()
            if existing:
                print(f"  ✓ Product exists: {p['name']}")
                continue

            product = Product(
                name=p["name"],
                sku=p["sku"],
                slug=p["slug"],
                price=p["price"],
                discount_price=p.get("discount_price"),
                short_description=p["short_description"],
                long_description=p["long_description"],
                category_id=cat_map[p["category"]],
                brand_id=brand_map.get(p["brand"]),
                stock=p.get("stock", 50),
                min_stock_level=5,
                vat_rate=p.get("vat_rate", 20),
                status='PUBLISHED',
                has_variants=False,
                is_new=p.get("is_new", False),
                is_bestseller=p.get("is_bestseller", False),
                is_featured=p.get("is_featured", False),
                is_campaign=p.get("is_campaign", False),
            )
            session.add(product)
            print(f"  + Product created: {p['name']}")

        session.commit()
        print("\n🎉 Seeding complete!")

if __name__ == "__main__":
    seed()
