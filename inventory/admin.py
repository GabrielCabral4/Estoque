from django.contrib import admin
from .models import Category, Supplier, Product, StockMovement

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone')
    search_fields = ('name', 'contact_person')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'stock_quantity', 'price', 'is_low_stock', 'supplier')
    list_filter = ('category', 'supplier', 'created_at')
    search_fields = ('name', 'sku', 'description')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'unit_price', 'created_at', 'created_by')
    list_filter = ('movement_type', 'created_at')
    search_fields = ('product__name', 'reference', 'notes')