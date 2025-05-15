import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Estoque
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">Dashboard</Button>
          <Button color="inherit" component={Link} to="/products">Produtos</Button>
          <Button color="inherit" component={Link} to="/categories">Categorias</Button>
          <Button color="inherit" component={Link} to="/suppliers">Fornecedores</Button>
          <Button color="inherit" component={Link} to="/movements">Movimentações de Estoque</Button>
          <Button color="inherit" component={Link} to="/low_stocks">Estoque Baixo</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;