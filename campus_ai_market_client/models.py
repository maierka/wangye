from database import get_db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User:
    @staticmethod
    def create(username, password, email='', phone=''):
        db = get_db()
        cursor = db.cursor()
        hashed_password = generate_password_hash(password)
        try:
            cursor.execute(
                'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
                (username, hashed_password, email, phone)
            )
            db.commit()
            db.close()
            return True
        except:
            db.close()
            return False

    @staticmethod
    def verify(username, password):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        db.close()
        if user and check_password_hash(user['password'], password):
            return dict(user)
        return None

    @staticmethod
    def get_by_id(user_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        db.close()
        return dict(user) if user else None

    @staticmethod
    def get_by_username(username):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        db.close()
        return dict(user) if user else None

class Product:
    @staticmethod
    def create(title, description, price, category_id, seller_id, image=''):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO products (title, description, price, category_id, seller_id, image) VALUES (?, ?, ?, ?, ?, ?)',
            (title, description, price, category_id, seller_id, image)
        )
        db.commit()
        product_id = cursor.lastrowid
        db.close()
        return product_id

    @staticmethod
    def get_all(category_id=None, keyword=None, page=1, per_page=20):
        db = get_db()
        cursor = db.cursor()

        query = '''
            SELECT p.*, c.name as category_name, c.icon as category_icon,
                   u.username as seller_name, u.avatar as seller_avatar
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'available'
        '''
        params = []

        if category_id:
            query += ' AND p.category_id = ?'
            params.append(category_id)

        if keyword:
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)'
            params.extend([f'%{keyword}%', f'%{keyword}%'])

        query += ' ORDER BY p.created_at DESC'
        query += f' LIMIT {per_page} OFFSET {(page-1) * per_page}'

        cursor.execute(query, params)
        products = [dict(row) for row in cursor.fetchall()]
        db.close()
        return products

    @staticmethod
    def get_by_id(product_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT p.*, c.name as category_name, c.icon as category_icon,
                   u.username as seller_name, u.avatar as seller_avatar
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.id = ?
        ''', (product_id,))
        product = cursor.fetchone()

        if product:
            cursor.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', (product_id,))
            db.commit()

        db.close()
        return dict(product) if product else None

    @staticmethod
    def get_by_seller(seller_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT p.*, c.name as category_name, c.icon as category_icon
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.seller_id = ?
            ORDER BY p.created_at DESC
        ''', (seller_id,))
        products = [dict(row) for row in cursor.fetchall()]
        db.close()
        return products

    @staticmethod
    def delete(product_id, seller_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('DELETE FROM products WHERE id = ? AND seller_id = ?', (product_id, seller_id))
        db.commit()
        deleted = cursor.rowcount > 0
        db.close()
        return deleted

class Category:
    @staticmethod
    def get_all():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM categories ORDER BY id')
        categories = [dict(row) for row in cursor.fetchall()]
        db.close()
        return categories

class Favorite:
    @staticmethod
    def add(user_id, product_id):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                (user_id, product_id)
            )
            db.commit()
            db.close()
            return True
        except:
            db.close()
            return False

    @staticmethod
    def remove(user_id, product_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
            (user_id, product_id)
        )
        db.commit()
        deleted = cursor.rowcount > 0
        db.close()
        return deleted

    @staticmethod
    def get_user_favorites(user_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT p.*, c.name as category_name, c.icon as category_icon,
                   u.username as seller_name, u.avatar as seller_avatar,
                   f.created_at as favorited_at
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        ''', (user_id,))
        favorites = [dict(row) for row in cursor.fetchall()]
        db.close()
        return favorites

    @staticmethod
    def is_favorited(user_id, product_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
            (user_id, product_id)
        )
        exists = cursor.fetchone() is not None
        db.close()
        return exists

class Follow:
    @staticmethod
    def add(follower_id, followed_id):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
                (follower_id, followed_id)
            )
            db.commit()
            db.close()
            return True
        except:
            db.close()
            return False

    @staticmethod
    def remove(follower_id, followed_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
            (follower_id, followed_id)
        )
        db.commit()
        deleted = cursor.rowcount > 0
        db.close()
        return deleted

    @staticmethod
    def get_user_followers(user_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT u.* FROM follows f
            JOIN users u ON f.follower_id = u.id
            WHERE f.followed_id = ?
        ''', (user_id,))
        followers = [dict(row) for row in cursor.fetchall()]
        db.close()
        return followers

    @staticmethod
    def get_user_followings(user_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT u.* FROM follows f
            JOIN users u ON f.followed_id = u.id
            WHERE f.follower_id = ?
        ''', (user_id,))
        followings = [dict(row) for row in cursor.fetchall()]
        db.close()
        return followings

    @staticmethod
    def is_following(follower_id, followed_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?',
            (follower_id, followed_id)
        )
        exists = cursor.fetchone() is not None
        db.close()
        return exists
