from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from .models import Category, Supplier, Product, StockMovement
from .serializers import (
    CategorySerializer, SupplierSerializer,
    ProductSerializer, StockMovementSerializer,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=F('reorder_level')
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def movements(self, request, pk=None):
        product = self.get_object()
        movements = product.stock_movements.all().order_by('-created_at')
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
    
class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().order_by('-created_at')
    serializer_class = StockMovementSerializer
    
    @action(detail=False, methods=['get'])
    def report(self, request):
        """Relatório simples de movimentação de estoque"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.queryset
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
            
        in_total = queryset.filter(movement_type='in').aggregate(
            total=Sum(F('quantity') * F('unit_price'))
        )['total'] or 0
        
        out_total = queryset.filter(movement_type='out').aggregate(
            total=Sum(F('quantity') * F('unit_price'))
        )['total'] or 0
        
        return Response({
            'entrada_total': in_total,
            'saida_total': out_total,
            'balanco': in_total - out_total
        })