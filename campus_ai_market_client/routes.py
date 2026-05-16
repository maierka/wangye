from flask import render_template, request, jsonify, session, redirect, url_for
from app import app
from models import User, Product, Category, Favorite, Follow

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.headers.get('Content-Type') == 'application/json':
                return jsonify({'error': '请先登录'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    category_id = request.args.get('category', type=int)
    keyword = request.args.get('keyword', '')
    page = request.args.get('page', 1, type=int)

    products = Product.get_all(category_id=category_id, keyword=keyword, page=page)
    categories = Category.get_all()

    user_id = session.get('user_id')
    favorites = []
    if user_id:
        user_favorites = Favorite.get_user_favorites(user_id)
        favorites = [f['id'] for f in user_favorites]

    return render_template('index.html',
                         products=products,
                         categories=categories,
                         current_category=category_id,
                         keyword=keyword,
                         favorites=favorites)

@app.route('/login')
def login():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/register')
def register():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    if len(password) < 6:
        return jsonify({'error': '密码至少6位'}), 400

    if User.get_by_username(username):
        return jsonify({'error': '用户名已存在'}), 400

    if User.create(username, password, email, phone):
        return jsonify({'message': '注册成功！请登录'})
    return jsonify({'error': '注册失败，请重试'}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    user = User.verify(username, password)
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({
            'message': '登录成功',
            'user': {'id': user['id'], 'username': user['username']}
        })
    return jsonify({'error': '用户名或密码错误'}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'message': '已退出登录'})

@app.route('/api/current_user', methods=['GET'])
def api_current_user():
    if 'user_id' in session:
        user = User.get_by_id(session['user_id'])
        return jsonify({
            'user': {
                'id': user['id'],
                'username': user['username'],
                'avatar': user['avatar']
            }
        })
    return jsonify({'user': None})

@app.route('/publish')
@login_required
def publish():
    categories = Category.get_all()
    return render_template('publish.html', categories=categories)

@app.route('/api/products', methods=['POST'])
@login_required
def api_create_product():
    data = request.get_json()
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    price = data.get('price', 0)
    category_id = data.get('category_id')
    image = data.get('image', '')

    if not title or price <= 0:
        return jsonify({'error': '请填写完整的商品信息'}), 400

    product_id = Product.create(title, description, price, category_id, session['user_id'], image)
    return jsonify({'message': '发布成功', 'product_id': product_id})

@app.route('/detail/<int:product_id>')
def detail(product_id):
    product = Product.get_by_id(product_id)
    if not product:
        return "商品不存在", 404

    categories = Category.get_all()

    user_id = session.get('user_id')
    is_favorited = False
    is_following = False
    if user_id:
        is_favorited = Favorite.is_favorited(user_id, product_id)
        if product['seller_id'] != user_id:
            is_following = Follow.is_following(user_id, product['seller_id'])

    seller_products = []
    if product['seller_id']:
        seller_products = Product.get_by_seller(product['seller_id'])[:4]

    return render_template('detail.html',
                         product=product,
                         categories=categories,
                         is_favorited=is_favorited,
                         is_following=is_following,
                         seller_products=seller_products)

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@login_required
def api_delete_product(product_id):
    product = Product.get_by_id(product_id)
    if not product:
        return jsonify({'error': '商品不存在'}), 404

    if product['seller_id'] != session['user_id']:
        return jsonify({'error': '无权删除此商品'}), 403

    if Product.delete(product_id, session['user_id']):
        return jsonify({'message': '删除成功'})
    return jsonify({'error': '删除失败'}), 500

@app.route('/api/favorites', methods=['POST'])
@login_required
def api_add_favorite():
    data = request.get_json()
    product_id = data.get('product_id')

    if Favorite.add(session['user_id'], product_id):
        return jsonify({'message': '收藏成功'})
    return jsonify({'error': '已收藏'}), 400

@app.route('/api/favorites/<int:product_id>', methods=['DELETE'])
@login_required
def api_remove_favorite(product_id):
    if Favorite.remove(session['user_id'], product_id):
        return jsonify({'message': '取消收藏成功'})
    return jsonify({'error': '取消收藏失败'}), 400

@app.route('/my_favorites')
@login_required
def my_favorites():
    favorites = Favorite.get_user_favorites(session['user_id'])
    favorites_ids = [f['id'] for f in favorites]
    return render_template('favorites.html',
                         favorites=favorites,
                         favorites_ids=favorites_ids)

@app.route('/profile/<int:user_id>')
def profile(user_id):
    user = User.get_by_id(user_id)
    if not user:
        return "用户不存在", 404

    products = Product.get_by_seller(user_id)
    followers = Follow.get_user_followers(user_id)
    followings = Follow.get_user_followings(user_id)

    current_user_id = session.get('user_id')
    is_following = False
    if current_user_id and current_user_id != user_id:
        is_following = Follow.is_following(current_user_id, user_id)

    return render_template('profile.html',
                         profile_user=user,
                         products=products,
                         followers=followers,
                         followings=followings,
                         is_following=is_following)

@app.route('/api/follow', methods=['POST'])
@login_required
def api_add_follow():
    data = request.get_json()
    followed_id = data.get('user_id')

    if followed_id == session['user_id']:
        return jsonify({'error': '不能关注自己'}), 400

    if Follow.add(session['user_id'], followed_id):
        return jsonify({'message': '关注成功'})
    return jsonify({'error': '已关注'}), 400

@app.route('/api/follow/<int:followed_id>', methods=['DELETE'])
@login_required
def api_remove_follow(followed_id):
    if Follow.remove(session['user_id'], followed_id):
        return jsonify({'message': '取消关注成功'})
    return jsonify({'error': '取消关注失败'}), 400

@app.route('/api/categories', methods=['GET'])
def api_categories():
    categories = Category.get_all()
    return jsonify({'categories': categories})
