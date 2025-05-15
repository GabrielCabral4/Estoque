import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, CircularProgress, Alert
} from '@mui/material';
import { productService } from '../services/api';

const LowStockProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro tenta a API específica
      if (!useFallback) {
        try {
          const response = await productService.getLowStock();
          setProducts(response.data || []);
          return;
        } catch (apiError) {
          console.warn('API de estoque baixo falhou, usando fallback', apiError);
          setUseFallback(true);
        }
      }
      
      // Fallback: busca todos e filtra localmente
      const allProductsResponse = await productService.getAll();
      const allProducts = allProductsResponse.data.results || allProductsResponse.data || [];
      const lowStockProducts = allProducts.filter(product => 
        (product.stock_quantity || 0) <= (product.reorder_level || 0)
      );
      setProducts(lowStockProducts);
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos com estoque baixo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [useFallback]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchLowStockProducts} sx={{ ml: 2 }}>Tentar novamente</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Produtos com Estoque Baixo
      </Typography>
      
      {useFallback && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Usando cálculo local de estoque baixo (a API específica não está disponível)
        </Alert>
      )}

      {products.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Estoque Atual</TableCell>
                <TableCell>Nível de Reposição</TableCell>
                <TableCell>Diferença</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.reorder_level}</TableCell>
                  <TableCell sx={{ color: 'error.main' }}>
                    {product.stock_quantity - product.reorder_level}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Nenhum produto com estoque baixo encontrado
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default LowStockProducts;