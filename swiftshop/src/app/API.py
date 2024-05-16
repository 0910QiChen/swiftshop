import random
from decimal import Decimal
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pyodbc
import json
import bcrypt
import re

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'CSC450'
jwt = JWTManager(app)

# Connection parameters
server = 'aawcl.database.windows.net'
database = 'AAWCL'
username = 'aawcladmin'
password = 'CSC430server'

# Establish connection
conn = pyodbc.connect('DRIVER={SQL Server};SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)

# Create cursor
cursor = conn.cursor()

def hash_password(password):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password.decode('utf-8')

def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def validate_username(username):
    # Define the regex pattern for the username
    pattern = r'^[a-zA-Z0-9]{8,}$'

    # Check if the username matches the pattern
    if re.match(pattern, username):
        return True
    else:
        return False

def validate_password(password):
    # Define the regex pattern for the password
    pattern = r'^[a-zA-Z0-9]{8,}$'

    # Check if the password matches the pattern
    if re.match(pattern, password):
        return True
    else:
        return False

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        return True
    else:
        return False

# Create a new user from signup
@app.route('/signup', methods=['POST'])
def create_user():
    data = request.json
    Username = data.get('Username')
    Email = data.get('Email')
    Password = data.get('PasswordHash')
    cursor.execute('SELECT * FROM Shopusers WHERE Username = ?', Username)
    user = cursor.fetchone()
    cursor.execute('SELECT * FROM Shopusers WHERE Email = ?', Email)
    email = cursor.fetchone()

    if user or email:
        return jsonify({'message': 'Username or Email Existed'}), 400

    if not validate_username(Username):
        return jsonify({'message': 'Username must be at least 8 characters(lower case, uppercase or digits) long'}), 400

    if not validate_email(Email):
        return jsonify({'message': 'Please enter valid email address'}), 400

    if not validate_password(Password):
        return jsonify({'message': 'Password must be at least 8 characters(lower case, uppercase or digits) long'}), 400

    if not all(key in data for key in ('Username', 'PasswordHash')):
        return jsonify({'error': 'Missing username or password'}), 400

    # Insert into database
    cursor.execute(
        'INSERT INTO Shopusers (Username, PasswordHash, Email, FullName, CurrAddr) VALUES (?, ?, ?, ?, ?)',
        data['Username'], hash_password(Password), data['Email'], data['FullName'], data['CurrAddr'])
    conn.commit()

    return jsonify({'message': 'User created successfully'}), 201

# Check for login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    Username = data.get('Username')
    Password = data.get('PasswordHash')
    cursor.execute('SELECT * FROM Shopusers WHERE Username = ?', Username)
    user = cursor.fetchone()
    if not user:
        return jsonify({'message': 'User does not exist'}), 401

    if not Username or not Password:
        return jsonify({'message': 'Missing username or password'}), 400

    if verify_password(Password, user.PasswordHash):
        access_token = create_access_token(identity=user.UserID)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

# Delete user by UserID
@app.route('/users/<int:UserID>', methods=['DELETE'])
def delete_user(UserID):
    cursor.execute('SELECT * FROM Users WHERE UserID = ?', UserID)
    user = cursor.fetchone()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    cursor.execute('DELETE FROM Users WHERE UserID = ?', UserID)
    conn.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

# Get items from database
@app.route('/getitems', methods=['GET'])
def get_items():
    cursor.execute("SELECT TOP 40 * FROM Items")
    items = cursor.fetchall()

    result_list = []
    for item in items:
        item_dict = {
            'ItemID': item[0],
            'ItemName': item[1],
            'ItemDesc': item[2],
            'Price': float(item[3])
        }
        result_list.append(item_dict)
    json_result = json.dumps(result_list)

    return jsonify(json_result), 200

# Add items to cart
@app.route('/addtocart', methods=['POST'])
@jwt_required()
def add_to_cart():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_field = ['ItemID', 'Quantity']
    for field in required_field:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    cursor.execute('SELECT * FROM Items WHERE ItemID = ?', data['ItemID'])
    item = cursor.fetchone()
    if not item:
        return jsonify({'error': 'Item does not exists'}), 400
    
    user_id = get_jwt_identity()
    cursor.execute('SELECT * FROM Shopusers WHERE UserID = ?', user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'You must be a user to add an item to cart'}), 404

    cursor.execute('INSERT INTO Cart (UserID, ItemID, Quantity) VALUES (?, ?, ?)', user_id, data['ItemID'], data['Quantity'])
    conn.commit()
    return jsonify({'message': 'Successfully add to cart'}), 200

# View what's inside of cart
@app.route('/viewcart', methods=['GET'])
@jwt_required()
def view_cart():
    user_id = get_jwt_identity()
    cursor.execute('SELECT * FROM Shopusers WHERE UserID = ?', user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'You must be a user to view item in cart'}), 404
    
    cursor.execute('SELECT * FROM Cart WHERE UserID = ?', user_id)
    cart = cursor.fetchall()
    result_list = []

    for itemID in cart:
        cursor.execute('SELECT * FROM Items Where ItemID = ?', itemID[2])
        item = cursor.fetchone()
        item_dict = {
            'ItemID': itemID[2],
            'ItemName': item[1],
            'ItemDesc': item[2],
            'Quantity': itemID[3],
            'Price': float(item[3])
        }
        result_list.append(item_dict)
    json_result = json.dumps(result_list)
    return jsonify(json_result), 200

# Delete items from cart
@app.route('/deletefromcart/<int:item_id>', methods=['DELETE'])
def delete_from_cart(item_id):

    cursor.execute('SELECT * FROM Cart Where ItemID = ?', item_id)
    item = cursor.fetchone()
    if not item:
        return jsonify({'error': 'Item does not exist in the cart'}), 400

    cursor.execute('DELETE FROM Cart WHERE ItemID = ?', item_id)
    conn.commit()
    return jsonify({'message': 'Item removed from cart successfully'}), 200

# Change quantity of items
@app.route('/changequantity/<int:item_id>', methods=['POST'])
def change_quantity(item_id):
    data = request.json
    quantity = data['Quantity']
    cursor.execute("UPDATE Cart SET quantity = ? WHERE ItemID = ?", (quantity, item_id))
    conn.commit()
    return jsonify({'message': 'Quantity updated successfully'}), 200

def generate_tracking_number(length=20):
    """Generate a random tracking number."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# Ordering cart items
@app.route('/order', methods=['POST'])
@jwt_required()
def order():
    user_id = get_jwt_identity()
    cursor.execute('SELECT * FROM Shopusers WHERE UserID = ?', user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'You must be a user to order items'}), 404
    cursor.execute('SELECT * FROM Cart WHERE UserID = ?', user_id)
    order_list = cursor.fetchall()
    tracking_number = generate_tracking_number()
    for items in order_list:
        item_id = items[2]
        cursor.execute('SELECT * FROM Items WHERE ItemID = ?', item_id)
        item = cursor.fetchone()
        item_name = item[1]
        quantity = items[3]
        price = item[3]*quantity
        cursor.execute('INSERT INTO OrderItems (TrackingNumber, UserID, ItemID, ItemName, Quantity, Price) VALUES (?, ?, ?, ?, ?)', tracking_number, user_id, item_id, item_name, quantity, price)
        conn.commit()
        cursor.execute('DELETE FROM Cart WHERE ItemID = ?', item_id)
        conn.commit()
    return jsonify({'message': 'Successfully ordered!'}), 200

@app.route('/tracking', methods=['GET'])
@jwt_required()
def get_tracking_numbers():
    user_id = get_jwt_identity()
    cursor.execute('SELECT * FROM Shopusers WHERE UserID = ?', user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'You must be a user to view your history'}), 404
    
    cursor.execute('SELECT * FROM OrderItems WHERE UserID = ?', user_id)
    trackingNumbers = cursor.fetchall()
    if not trackingNumbers:
        return jsonify({'error': 'No order has been sumbitted'})
    
    tracking = []
    for trackingNumber in trackingNumbers:
        track_dict = {
            'TrackingNumber': trackingNumber['TrackingNumber'],
        }
        tracking.append(track_dict)
    json_result = json.dumps(tracking)
    return jsonify(json_result), 200

# Check order history
@app.route('/orderhistory', methods=['POST'])
@jwt_required()
def get_order_history():
    user_id = get_jwt_identity()
    cursor.execute('SELECT * FROM Shopusers WHERE UserID = ?', user_id)
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'You must be a user to view your history'}), 404
    
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 404
    
    cursor.execute('SELECT * FROM OrderItems WHERE TrackingNumber = ?', data['TrackingNumber'])
    logs = cursor.fetchall()
    if not logs:
        return jsonify({'error': 'No logs exist'}), 400

    history = []
    for log in logs:
        log_dict = dict(zip([column[0] for column in cursor.description], log))

        log_dict['Price'] = float(log_dict['Price'])

        log_dict['OrderDate'] = log_dict['OrderDate'].isoformat()

        log_dict = {

        }

        history.append(log_dict)

    json_result = json.dumps(history)
    return jsonify(json_result), 200

if __name__ == '__main__':
    app.run(debug=True)