import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { productService, categoryService, supplierService } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    sku: '',
    description: '',
    price: 0,
    cost: 0,
    stock_quantity: 0,
    reorder_level: 10,
    category: '',
    supplier: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditMode(false);
    setCurrentProduct({
      id: null,
      name: '',
      sku: '',
      description: '',
      price: 0,
      cost: 0,
      stock_quantity: 0,
      reorder_level: 10,
      category: '',
      supplier: ''
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({
      ...product,
      category: product.category,
      supplier: product.supplier
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(productId);
        fetchProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await productService.update(currentProduct.id, currentProduct);
      } else {
        await productService.create(currentProduct);
      }
      
      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Produtos
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ mb: 3 }}
      >
        Adicionar Produto
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category_name}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>R$ {product.price}</TableCell>
                <TableCell>
                  {product.is_low_stock ? (
                    <Typography color="error">Estoque Baixo</Typography>
                  ) : (
                    <Typography color="success.main">Em Estoque</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditProduct(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteProduct(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Modal de Cadastro/Edição de Produto */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nome do Produto"
              type="text"
              fullWidth
              variant="outlined"
              value={currentProduct.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="sku"
              label="SKU"
              type="text"
              fullWidth
              variant="outlined"
              value={currentProduct.sku}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Descrição"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={currentProduct.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={currentProduct.category}
                label="Categoria"
                onChange={handleInputChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="supplier-label">Fornecedor</InputLabel>
              <Select
                labelId="supplier-label"
                name="supplier"
                value={currentProduct.supplier}
                label="Fornecedor"
                onChange={handleInputChange}
                required
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              name="price"
              label="Preço de Venda"
              type="number"
              fullWidth
              variant="outlined"
              value={currentProduct.price}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="cost"
              label="Custo"
              type="number"
              fullWidth
              variant="outlined"
              value={currentProduct.cost}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="stock_quantity"
              label="Quantidade em Estoque"
              type="number"
              fullWidth
              variant="outlined"
              value={currentProduct.stock_quantity}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="reorder_level"
              label="Nível de Reposição"
              type="number"
              fullWidth
              variant="outlined"
              value={currentProduct.reorder_level}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products;