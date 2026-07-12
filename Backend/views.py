import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Backend import db

# Auto-initialize database on import/startup
db.init_db()

# --- Customer APIs ---
@csrf_exempt
def customers_add(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['full_name', 'email', 'phone', 'address', 'city', 'password']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
        
        # Check if customer already exists
        if db.get_customer_by_email(data['email']):
            return JsonResponse({"error": "A customer with this email already exists."}, status=400)
            
        custom_id = data.get('customer_id')
        new_id = db.add_customer(
            full_name=data['full_name'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            city=data['city'],
            password=data['password'],
            customer_id=custom_id
        )
        return JsonResponse({
            "message": "Customer registered successfully.",
            "customer_id": new_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def customers_list(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed. Use GET."}, status=405)
    try:
        customers = db.get_customers()
        return JsonResponse(customers, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def customers_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({"error": "Method not allowed. Use PUT."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['full_name', 'email', 'phone', 'address', 'city']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        success = db.update_customer(
            cid=id,
            full_name=data['full_name'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            city=data['city'],
            password=data.get('password')
        )
        if success:
            return JsonResponse({"message": f"Customer {id} updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Customer not found or no changes made."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def customers_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed. Use DELETE."}, status=405)
    try:
        success = db.delete_customer(id)
        if success:
            return JsonResponse({"message": f"Customer {id} deleted successfully."}, status=200)
        else:
            return JsonResponse({"error": "Customer not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# --- Customer Authentication ---
@csrf_exempt
def customer_login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        if 'email' not in data or 'password' not in data:
            return JsonResponse({"error": "Missing email or password."}, status=400)
        
        customer = db.get_customer_by_email(data['email'])
        if customer and customer['password'] == data['password']:
            # Create a clean session-like payload
            # Removing password for safety
            customer_data = dict(customer)
            customer_data.pop('password', None)
            return JsonResponse({
                "message": "Login successful.",
                "customer": customer_data
            }, status=200)
        else:
            return JsonResponse({"error": "Invalid email or password."}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- Category APIs ---
@csrf_exempt
def categories_add(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['category_name', 'description']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        custom_id = data.get('category_id')
        new_id = db.add_category(
            category_name=data['category_name'],
            description=data['description'],
            category_id=custom_id
        )
        return JsonResponse({
            "message": "Category added successfully.",
            "category_id": new_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def categories_list(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed. Use GET."}, status=405)
    try:
        categories = db.get_categories()
        return JsonResponse(categories, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def categories_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({"error": "Method not allowed. Use PUT."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['category_name', 'description']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        success = db.update_category(
            cat_id=id,
            category_name=data['category_name'],
            description=data['description']
        )
        if success:
            return JsonResponse({"message": f"Category {id} updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Category not found or no changes made."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def categories_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed. Use DELETE."}, status=405)
    try:
        success = db.delete_category(id)
        if success:
            return JsonResponse({"message": f"Category {id} deleted successfully."}, status=200)
        else:
            return JsonResponse({"error": "Category not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- Product APIs ---
@csrf_exempt
def products_add(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['product_name', 'category', 'brand', 'size', 'color', 'price', 'stock', 'image_url']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        custom_id = data.get('product_id')
        new_id = db.add_product(
            product_name=data['product_name'],
            category=data['category'],
            brand=data['brand'],
            size=data['size'],
            color=data['color'],
            price=float(data['price']),
            stock=int(data['stock']),
            image_url=data['image_url'],
            product_id=custom_id
        )
        return JsonResponse({
            "message": "Product added successfully.",
            "product_id": new_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def products_list(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed. Use GET."}, status=405)
    try:
        products = db.get_products()
        return JsonResponse(products, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def products_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({"error": "Method not allowed. Use PUT."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['product_name', 'category', 'brand', 'size', 'color', 'price', 'stock', 'image_url']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        success = db.update_product(
            pid=id,
            product_name=data['product_name'],
            category=data['category'],
            brand=data['brand'],
            size=data['size'],
            color=data['color'],
            price=float(data['price']),
            stock=int(data['stock']),
            image_url=data['image_url']
        )
        if success:
            return JsonResponse({"message": f"Product {id} updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Product not found or no changes made."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def products_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed. Use DELETE."}, status=405)
    try:
        success = db.delete_product(id)
        if success:
            return JsonResponse({"message": f"Product {id} deleted successfully."}, status=200)
        else:
            return JsonResponse({"error": "Product not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- Cart APIs ---
@csrf_exempt
def cart_add(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['customer_name', 'product_name', 'quantity', 'price']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        custom_id = data.get('cart_id')
        new_id = db.add_cart_item(
            customer_name=data['customer_name'],
            product_name=data['product_name'],
            quantity=int(data['quantity']),
            price=float(data['price']),
            cart_id=custom_id
        )
        return JsonResponse({
            "message": "Product added to cart successfully.",
            "cart_id": new_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def cart_list(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed. Use GET."}, status=405)
    try:
        customer_name = request.GET.get('customer_name')
        if customer_name:
            items = db.get_cart_items_by_customer(customer_name)
        else:
            items = db.get_cart_items()
        return JsonResponse(items, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def cart_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({"error": "Method not allowed. Use PUT."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['quantity', 'price']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        success = db.update_cart_item(
            cart_id=id,
            quantity=int(data['quantity']),
            price=float(data['price'])
        )
        if success:
            return JsonResponse({"message": f"Cart item {id} updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Cart item not found or no changes made."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def cart_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed. Use DELETE."}, status=405)
    try:
        success = db.delete_cart_item(id)
        if success:
            return JsonResponse({"message": f"Cart item {id} deleted successfully."}, status=200)
        else:
            return JsonResponse({"error": "Cart item not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- Order APIs ---
@csrf_exempt
def orders_add(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['customer_name', 'order_date', 'total_amount', 'payment_method', 'payment_status', 'delivery_status']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        custom_id = data.get('order_id')
        new_id = db.add_order(
            customer_name=data['customer_name'],
            order_date=data['order_date'],
            total_amount=float(data['total_amount']),
            payment_method=data['payment_method'],
            payment_status=data['payment_status'],
            delivery_status=data['delivery_status'],
            order_id=custom_id
        )
        
        # Automatically clear cart for this customer after order placement
        db.clear_customer_cart(data['customer_name'])
        
        return JsonResponse({
            "message": "Order placed successfully.",
            "order_id": new_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def orders_list(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Method not allowed. Use GET."}, status=405)
    try:
        customer_name = request.GET.get('customer_name')
        if customer_name:
            orders = db.get_orders_by_customer(customer_name)
        else:
            orders = db.get_orders()
        return JsonResponse(orders, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def orders_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({"error": "Method not allowed. Use PUT."}, status=405)
    try:
        data = json.loads(request.body)
        required = ['customer_name', 'order_date', 'total_amount', 'payment_method', 'payment_status', 'delivery_status']
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields."}, status=400)
            
        success = db.update_order(
            oid=id,
            customer_name=data['customer_name'],
            order_date=data['order_date'],
            total_amount=float(data['total_amount']),
            payment_method=data['payment_method'],
            payment_status=data['payment_status'],
            delivery_status=data['delivery_status']
        )
        if success:
            return JsonResponse({"message": f"Order {id} updated successfully."}, status=200)
        else:
            return JsonResponse({"error": "Order not found or no changes made."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def orders_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Method not allowed. Use DELETE."}, status=405)
    try:
        success = db.delete_order(id)
        if success:
            return JsonResponse({"message": f"Order {id} deleted successfully."}, status=200)
        else:
            return JsonResponse({"error": "Order not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
