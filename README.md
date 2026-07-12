# Fashion Store Website (AURA Couture)

A full-stack, premium fashion store web application featuring a rich, responsive Dark-Luxury UI frontend and a robust Django REST API backend built using Function-Based Views (FBV) and direct SQLite queries.

## 🌟 Key Features
- **Customer Management**: Profile registration, user authentication, and secure login.
- **Category Management**: Admin interface to configure different clothing, footwear, and accessory categories.
- **Product Catalog**: Dynamic catalog rendering with search and price range filters.
- **Shopping Cart**: Fully operational cart allowing real-time quantity modifications and item removals.
- **Order Placement**: Multi-payment checkout forms connected with live inventory stock calculations.
- **Timeline Orders Tracker**: Track purchase lists, payment statuses, and delivery states.
- **Admin Console**: Fully unified control panel enabling instant CRUD operations over all database tables.

---

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3, Javascript (ES6), Fetch API.
- **Backend**: Django 6.0+, Python 3.14+, Function-Based Views, Django REST responses.
- **Database**: SQLite (Self-initializing & pre-seeded with sample testing data).

---

## 📁 Project Directory Structure
```
Fashion Store Website/
│
├── README.md                 # Project instructions and documentation
├── manage.py                 # Django execution manager script
├── db.sqlite3                # SQLite database (auto-created on startup)
│
├── Backend/                  # Python backend Django module
│     ├── settings.py         # Core configurations & custom CORS headers
│     ├── middleware.py       # CORS handler middleware for preflight and CORS
│     ├── urls.py             # API and fallback static routing patterns
│     ├── db.py               # SQLite custom connection manager & seed data
│     └── views.py            # 20 Function-Based REST API endpoints + Login
│
└── Frontend/                 # Static frontend interface assets
      ├── index.html          # Homepage (Nav, Slider, Categories, Featured grid)
      ├── login.html          # Sign-in portal
      ├── register.html       # Sign-up portal
      ├── products.html       # Catalog shopping lists & filters
      ├── cart.html           # Shopping bag overview
      ├── checkout.html       # Shipping forms and payment selectors
      ├── orders.html         # Personal purchase order list
      ├── dashboard.html      # Admin CRUD console
      ├── style.css           # Luxury theme styling (Montserrat typography)
      └── script.js           # Unified logic executing Fetch requests
```

---

## 🚀 Step-by-Step Installation & Local Run

Follow these simple steps to run the application locally on your machine:

### 1. Launch the Django Server
Run the standard Django development server directly from the workspace directory. Database initialization and sample data seeding will run automatically!
```bash
python3 manage.py runserver
```

### 2. Open in Browser
Once the server starts up, open the application in your browser:
* **Frontend Application**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 🔐 Testing Accounts (Pre-Seeded)

For testing purposes, the SQLite database is automatically populated with the following demo credentials on the first run:

### 👤 Customer Account
- **Email**: `rahul@gmail.com`
- **Password**: `password123`
- **Full Name**: Rahul Sharma
- *(Used to browse items, add to cart, check out, and track order histories)*

### 👑 Administrator Account
- **Email**: `admin@fashion.com`
- **Password**: `admin123`
- *(Used to access the complete CRUD console to manage products, categories, customers, and orders)*

---

## 🔗 CRUD API Endpoints (20 Total)

The server supports the following API endpoints matching the specification requirements:

### 👥 Customer Management (Module 1)
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/customers/add/` | Register/Create a new customer profile |
| **GET** | `/customers/` | List all registered customers |
| **PUT** | `/customers/update/<id>/` | Update specific customer details |
| **DELETE** | `/customers/delete/<id>/` | Delete customer by ID |
| **POST** | `/login/` | Log in and authenticate a customer |

### 📁 Category Management (Module 2)
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/categories/add/` | Add a new product category |
| **GET** | `/categories/` | List all product categories |
| **PUT** | `/categories/update/<id>/` | Edit category information |
| **DELETE** | `/categories/delete/<id>/` | Delete a category |

### 👚 Product Management (Module 3)
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/products/add/` | Insert a new product into inventory |
| **GET** | `/products/` | Fetch products catalog |
| **PUT** | `/products/update/<id>/` | Modify product details |
| **DELETE** | `/products/delete/<id>/` | Delete product from catalog |

### 🛒 Shopping Cart (Module 4)
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/cart/add/` | Add an item to the shopping cart |
| **GET** | `/cart/` | Retrieve active cart (filters by `?customer_name=`) |
| **PUT** | `/cart/update/<id>/` | Adjust cart item quantities |
| **DELETE** | `/cart/delete/<id>/` | Remove an item from the cart |

### 📦 Order Placement (Module 5)
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/orders/add/` | Save order placement details (clears cart) |
| **GET** | `/orders/` | Retrieve order list (filters by `?customer_name=`) |
| **PUT** | `/orders/update/<id>/` | Modify order payment/delivery status |
| **DELETE** | `/orders/delete/<id>/` | Cancel or delete an order record |

---

## 🧪 Terminal Test Commands (cURL Examples)

To quickly test the APIs from your terminal, execute the following commands while the server is running:

### 1. Fetch all products
```bash
curl -X GET http://127.0.0.1:8000/products/
```

### 2. Add a new category
```bash
curl -X POST http://127.0.0.1:8000/categories/add/ \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Winter Wear", "description": "Coats, Sweaters, Thermals"}'
```

### 3. Authenticate user login
```bash
curl -X POST http://127.0.0.1:8000/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "rahul@gmail.com", "password": "password123"}'
```
