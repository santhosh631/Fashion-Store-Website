import sqlite3
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.path.join(BASE_DIR, 'db.sqlite3')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force=False):
    conn = get_db_connection()
    cursor = conn.cursor()

    if force:
        cursor.execute("DROP TABLE IF EXISTS customers")
        cursor.execute("DROP TABLE IF EXISTS categories")
        cursor.execute("DROP TABLE IF EXISTS products")
        cursor.execute("DROP TABLE IF EXISTS cart")
        cursor.execute("DROP TABLE IF EXISTS orders")

    # 1. Customers Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        password TEXT NOT NULL
    )
    ''')

    # 2. Categories Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        category_id INTEGER PRIMARY KEY,
        category_name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL
    )
    ''')

    # 3. Products Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT NOT NULL
    )
    ''')

    # 4. Cart Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cart (
        cart_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total_price REAL NOT NULL
    )
    ''')

    # 5. Orders Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        delivery_status TEXT NOT NULL
    )
    ''')

    conn.commit()

    # Check if empty, then seed sample data
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        # Seed Customer
        # Simple plain password for demo purposes (can hash later, but keeping simple matching standard Django/FBV demo)
        cursor.execute('''
        INSERT INTO customers (customer_id, full_name, email, phone, address, city, password)
        VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'KPHB Colony', 'Hyderabad', 'password123')
        ''')

        # Seed Category
        cursor.execute('''
        INSERT INTO categories (category_id, category_name, description)
        VALUES (201, "Men's Clothing", 'Shirts, T-Shirts, Jeans, Jackets')
        ''')
        cursor.execute('''
        INSERT INTO categories (category_id, category_name, description)
        VALUES (202, "Women's Clothing", 'Dresses, Tops, Skirts, Cardigans')
        ''')
        cursor.execute('''
        INSERT INTO categories (category_id, category_name, description)
        VALUES (203, 'Footwear', 'Sneakers, Chelsea Boots, Loafers, Heels')
        ''')
        cursor.execute('''
        INSERT INTO categories (category_id, category_name, description)
        VALUES (204, 'Accessories', 'Watches, Sunglasses, Bags, Belts')
        ''')

        # Seed Product
        cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (301, 'Slim Fit Denim Jacket', "Men's Clothing", "Levi's", 'L', 'Blue', 2499.0, 25, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60')
        ''')
        cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (302, 'Floral Print A-Line Dress', "Women's Clothing", 'Zara', 'M', 'Pink', 3499.0, 15, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60')
        ''')
        cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (303, 'Leather Chelsea Boots', 'Footwear', 'Woodland', '10', 'Tan', 4999.0, 12, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60')
        ''')
        cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (304, 'Premium Chronograph Watch', 'Accessories', 'Fossil', 'One Size', 'Black', 12999.0, 8, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60')
        ''')
        cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (305, 'Oversized Cotton Hoodie', "Men's Clothing", 'H&M', 'XL', 'Grey', 1999.0, 30, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60')
        ''')

        # Seed Cart
        cursor.execute('''
        INSERT INTO cart (cart_id, customer_name, product_name, quantity, price, total_price)
        VALUES (401, 'Rahul Sharma', 'Slim Fit Denim Jacket', 2, 2499.0, 4998.0)
        ''')

        # Seed Order
        cursor.execute('''
        INSERT INTO orders (order_id, customer_name, order_date, total_amount, payment_method, payment_status, delivery_status)
        VALUES (501, 'Rahul Sharma', '2026-07-15', 4998.0, 'UPI', 'Paid', 'Processing')
        ''')

        conn.commit()

    conn.close()

# CUSTOMER CRUD
def get_customers():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM customers").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_customer_by_id(cid):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM customers WHERE customer_id = ?", (cid,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_customer_by_email(email):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM customers WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_customer(full_name, email, phone, address, city, password, customer_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if customer_id is None:
        row = cursor.execute("SELECT MAX(customer_id) FROM customers").fetchone()
        customer_id = (row[0] + 1) if (row[0] is not None) else 101
    
    cursor.execute('''
        INSERT INTO customers (customer_id, full_name, email, phone, address, city, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (customer_id, full_name, email, phone, address, city, password))
    conn.commit()
    conn.close()
    return customer_id

def update_customer(cid, full_name, email, phone, address, city, password=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if password:
        cursor.execute('''
            UPDATE customers SET full_name=?, email=?, phone=?, address=?, city=?, password=?
            WHERE customer_id=?
        ''', (full_name, email, phone, address, city, password, cid))
    else:
        cursor.execute('''
            UPDATE customers SET full_name=?, email=?, phone=?, address=?, city=?
            WHERE customer_id=?
        ''', (full_name, email, phone, address, city, cid))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def delete_customer(cid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers WHERE customer_id = ?", (cid,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


# CATEGORY CRUD
def get_categories():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM categories").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_category_by_id(cat_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM categories WHERE category_id = ?", (cat_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_category(category_name, description, category_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if category_id is None:
        row = cursor.execute("SELECT MAX(category_id) FROM categories").fetchone()
        category_id = (row[0] + 1) if (row[0] is not None) else 201
    
    cursor.execute('''
        INSERT INTO categories (category_id, category_name, description)
        VALUES (?, ?, ?)
    ''', (category_id, category_name, description))
    conn.commit()
    conn.close()
    return category_id

def update_category(cat_id, category_name, description):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE categories SET category_name=?, description=?
        WHERE category_id=?
    ''', (category_name, description, cat_id))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def delete_category(cat_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM categories WHERE category_id = ?", (cat_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


# PRODUCT CRUD
def get_products():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_product_by_id(pid):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM products WHERE product_id = ?", (pid,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_product(product_name, category, brand, size, color, price, stock, image_url, product_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if product_id is None:
        row = cursor.execute("SELECT MAX(product_id) FROM products").fetchone()
        product_id = (row[0] + 1) if (row[0] is not None) else 301
    
    cursor.execute('''
        INSERT INTO products (product_id, product_name, category, brand, size, color, price, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (product_id, product_name, category, brand, size, color, price, stock, image_url))
    conn.commit()
    conn.close()
    return product_id

def update_product(pid, product_name, category, brand, size, color, price, stock, image_url):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE products SET product_name=?, category=?, brand=?, size=?, color=?, price=?, stock=?, image_url=?
        WHERE product_id=?
    ''', (product_name, category, brand, size, color, price, stock, image_url, pid))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def delete_product(pid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE product_id = ?", (pid,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


# CART CRUD
def get_cart_items():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM cart").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_cart_items_by_customer(customer_name):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM cart WHERE customer_name = ?", (customer_name,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_cart_item_by_id(cart_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM cart WHERE cart_id = ?", (cart_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_cart_item(customer_name, product_name, quantity, price, cart_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if cart_id is None:
        row = cursor.execute("SELECT MAX(cart_id) FROM cart").fetchone()
        cart_id = (row[0] + 1) if (row[0] is not None) else 401
    
    total_price = quantity * price
    
    # Check if this item is already in customer's cart
    existing = cursor.execute("SELECT * FROM cart WHERE customer_name = ? AND product_name = ?", (customer_name, product_name)).fetchone()
    if existing:
        new_qty = existing['quantity'] + quantity
        new_total = new_qty * price
        cursor.execute("UPDATE cart SET quantity = ?, total_price = ? WHERE cart_id = ?", (new_qty, new_total, existing['cart_id']))
        inserted_id = existing['cart_id']
    else:
        cursor.execute('''
            INSERT INTO cart (cart_id, customer_name, product_name, quantity, price, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (cart_id, customer_name, product_name, quantity, price, total_price))
        inserted_id = cart_id
        
    conn.commit()
    conn.close()
    return inserted_id

def update_cart_item(cart_id, quantity, price):
    conn = get_db_connection()
    cursor = conn.cursor()
    total_price = quantity * price
    cursor.execute('''
        UPDATE cart SET quantity=?, total_price=?
        WHERE cart_id=?
    ''', (quantity, total_price, cart_id))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def delete_cart_item(cart_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE cart_id = ?", (cart_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def clear_customer_cart(customer_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE customer_name = ?", (customer_name,))
    conn.commit()
    conn.close()


# ORDER CRUD
def get_orders():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM orders").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_orders_by_customer(customer_name):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM orders WHERE customer_name = ? ORDER BY order_id DESC", (customer_name,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_order_by_id(oid):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM orders WHERE order_id = ?", (oid,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_order(customer_name, order_date, total_amount, payment_method, payment_status, delivery_status, order_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if order_id is None:
        row = cursor.execute("SELECT MAX(order_id) FROM orders").fetchone()
        order_id = (row[0] + 1) if (row[0] is not None) else 501
        
    cursor.execute('''
        INSERT INTO orders (order_id, customer_name, order_date, total_amount, payment_method, payment_status, delivery_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (order_id, customer_name, order_date, total_amount, payment_method, payment_status, delivery_status))
    conn.commit()
    conn.close()
    return order_id

def update_order(oid, customer_name, order_date, total_amount, payment_method, payment_status, delivery_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE orders SET customer_name=?, order_date=?, total_amount=?, payment_method=?, payment_status=?, delivery_status=?
        WHERE order_id=?
    ''', (customer_name, order_date, total_amount, payment_method, payment_status, delivery_status, oid))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def delete_order(oid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM orders WHERE order_id = ?", (oid,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0
