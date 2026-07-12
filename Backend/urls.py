from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings
import os
from Backend import views

FRONTEND_DIR = os.path.join(settings.BASE_DIR, 'Frontend')

urlpatterns = [
    # Customer APIs
    path('customers/add/', views.customers_add, name='customers_add'),
    path('customers/', views.customers_list, name='customers_list'),
    path('customers/update/<int:id>/', views.customers_update, name='customers_update'),
    path('customers/delete/<int:id>/', views.customers_delete, name='customers_delete'),
    
    # Login API
    path('login/', views.customer_login, name='customer_login'),
    
    # Category APIs
    path('categories/add/', views.categories_add, name='categories_add'),
    path('categories/', views.categories_list, name='categories_list'),
    path('categories/update/<int:id>/', views.categories_update, name='categories_update'),
    path('categories/delete/<int:id>/', views.categories_delete, name='categories_delete'),
    
    # Product APIs
    path('products/add/', views.products_add, name='products_add'),
    path('products/', views.products_list, name='products_list'),
    path('products/update/<int:id>/', views.products_update, name='products_update'),
    path('products/delete/<int:id>/', views.products_delete, name='products_delete'),
    
    # Cart APIs
    path('cart/add/', views.cart_add, name='cart_add'),
    path('cart/', views.cart_list, name='cart_list'),
    path('cart/update/<int:id>/', views.cart_update, name='cart_update'),
    path('cart/delete/<int:id>/', views.cart_delete, name='cart_delete'),
    
    # Order APIs
    path('orders/add/', views.orders_add, name='orders_add'),
    path('orders/', views.orders_list, name='orders_list'),
    path('orders/update/<int:id>/', views.orders_update, name='orders_update'),
    path('orders/delete/<int:id>/', views.orders_delete, name='orders_delete'),
    
    # Serve index.html at root
    path('', serve, {'document_root': FRONTEND_DIR, 'path': 'index.html'}),
    
    # Serve all other static files from Frontend folder
    re_path(r'^(?P<path>.*)$', serve, {'document_root': FRONTEND_DIR}),
]
