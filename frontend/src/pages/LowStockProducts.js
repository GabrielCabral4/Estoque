import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, CircularProgress
} from '@mui/material';
import { productService } from '../services/api';

const LowStockProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll();
        const allProducts = response.data.results || response.data;
        
        // Filtrar produtos com estoque baixo localmente
        const lowStockProducts = allProducts.filter(product => 
          product.stock_quantity <= product.reorder_level
        );
        
        setProducts(lowStockProducts);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Produtos com Estoque Baixo
      </Typography>
      
      {products.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Nível de Reposição</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.reorder_level}</TableCell>
                  <TableCell>
                    <Typography color="error">Estoque Baixo</Typography>
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