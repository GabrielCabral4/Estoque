import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { productService, stockMovementService } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [recentMovements, setRecentMovements] = useState([]);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    }],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Buscar produtos (prioritário)
        const productsResponse = await productService.getAll();
        const products = productsResponse.data.results || productsResponse.data || [];
        
        setProductCount(products.length);
        
        // Calcular valor total do estoque
        const totalValue = products.reduce(
          (sum, product) => sum + ((product.price || 0) * (product.stock_quantity || 0)),
          0
        );
        setStockValue(totalValue);

        // 2. Tentar buscar produtos com estoque baixo (se falhar, não quebra o fluxo)
        try {
          const lowStockResponse = await productService.getLowStock();
          setLowStockCount(lowStockResponse.data?.length || 0);
        } catch (error) {
          console.warn('Erro ao buscar produtos com estoque baixo:', error);
          setLowStockCount(0);
        }

        // 3. Preparar dados do gráfico de categorias
        const categories = {};
        products.forEach(product => {
          const categoryName = product.category?.name || product.category_name || 'Sem categoria';
          categories[categoryName] = (categories[categoryName] || 0) + (product.stock_quantity || 0);
        });

        setCategoryData({
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          }],
        });

        // 4. Tentar buscar movimentações recentes (se falhar, não quebra o fluxo)
        try {
          const movementsResponse = await stockMovementService.getAll();
          const movements = movementsResponse.data.results || movementsResponse.data || [];
          setRecentMovements(movements.slice(0, 5));
        } catch (error) {
          console.warn('Erro ao buscar movimentações:', error);
          setRecentMovements([]);
        }

      } catch (error) {
        console.error('Erro ao carregar dados principais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Estoque
      </Typography>
      
      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">
              Total de Produtos
            </Typography>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {productCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">
              Produtos com Estoque Baixo
            </Typography>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {lowStockCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">
              Valor Total em Estoque
            </Typography>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              R$ {stockValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary">
              Últimas Movimentações
            </Typography>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {recentMovements.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Produtos por Categoria
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {categoryData.labels.length > 0 ? (
                <Doughnut 
                  data={categoryData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }} 
                />
              ) : (
                <Typography color="text.secondary">
                  Não há dados de categorias disponíveis
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              Últimas Movimentações
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentMovements.length > 0 ? (
                recentMovements.map((movement, index) => (
                  <Box key={index} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Grid container>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {movement.product_name || 'Produto não especificado'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {movement.movement_type === 'in' ? 'Entrada' : 'Saída'} de {movement.quantity} unidades
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color={movement.movement_type === 'in' ? 'success.main' : 'error.main'}>
                          {movement.movement_type === 'in' ? '+' : '-'} R$ {((movement.quantity || 0) * (movement.unit_price || 0)).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">
                    Nenhuma movimentação recente registrada
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;