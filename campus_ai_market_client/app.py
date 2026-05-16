from flask import Flask
from database import init_db

app = Flask(__name__)
app.config['SECRET_KEY'] = 'campus_market_secret_key_2024'
app.config['DATABASE'] = 'campus_market.db'

init_db(app)

from routes import *
from models import *

if __name__ == '__main__':
    app.run(debug=True, port=5000)
