import sqlite3
import os

DATABASE = 'campus_market.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(app):
    with app.app_context():
        db = get_db()
        cursor = db.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                avatar TEXT DEFAULT '/static/images/default_avatar.png',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image TEXT,
                category_id INTEGER,
                seller_id INTEGER NOT NULL,
                status TEXT DEFAULT 'available',
                view_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE(user_id, product_id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS follows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                follower_id INTEGER NOT NULL,
                followed_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (follower_id) REFERENCES users(id),
                FOREIGN KEY (followed_id) REFERENCES users(id),
                UNIQUE(follower_id, followed_id)
            )
        ''')

        cursor.execute("SELECT COUNT(*) FROM categories")
        if cursor.fetchone()[0] == 0:
            categories = [
                ('数码电子', '📱'),
                ('书籍教材', '📚'),
                ('服饰鞋包', '👕'),
                ('生活用品', '🏠'),
                ('运动健身', '⚽'),
                ('其他', '📦')
            ]
            cursor.executemany('INSERT INTO categories (name, icon) VALUES (?, ?)', categories)

        db.commit()
        db.close()
        print("数据库初始化完成！")
