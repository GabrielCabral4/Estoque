import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, MenuItem, Select, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { stockMovementService, productService } from '../services/api';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMovement, setCurrentMovement] = useState({
    id: null,
    product: '',
    quantity: 1,
    movement_type: 'in',
    unit_price: 0,
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  const fetchMovements = async () => {
    try {
      const response = await stockMovementService.getAll();
      setMovements(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditMode(false);
    setCurrentMovement({
      id: null,
      product: '',
      quantity: 1,
      movement_type: 'in',
      unit_price: 0,
      reference: '',
      notes: ''
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditMovement = (movement) => {
    setCurrentMovement({
      ...movement
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDeleteMovement = async (movementId) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação? Isso pode afetar o estoque atual.')) {
      try {
        await stockMovementService.delete(movementId);
        fetchMovements();
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMovement({
      ...currentMovement,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await stockMovementService.update(currentMovement.id, currentMovement);
      } else {
        await stockMovementService.create(currentMovement);
      }
      
      handleClose();
      fetchMovements();
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Movimentações de Estoque
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ mb: 3 }}
      >
        Nova Movimentação
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor Unitário</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Referência</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>{formatDate(movement.created_at)}</TableCell>
                <TableCell>{movement.product_name}</TableCell>
                <TableCell>
                  <Typography 
                    color={movement.movement_type === 'in' ? 'success.main' : 'error.main'}
                  >
                    {movement.movement_type_display}
                  </Typography>
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>R$ {Number(movement.unit_price).toFixed(2)}</TableCell>
                <TableCell>R$ {(movement.quantity * movement.unit_price).toFixed(2)}</TableCell>
                <TableCell>{movement.reference}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditMovement(movement)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteMovement(movement.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Modal de Cadastro/Edição de Movimentação */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Editar Movimentação' : 'Nova Movimentação'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="product-label">Produto</InputLabel>
                  <Select
                    labelId="product-label"
                    name="product"
                    value={currentMovement.product}
                    label="Produto"
                    onChange={handleInputChange}
                    disabled={editMode}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} (SKU: {product.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="movement-type-label">Tipo de Movimentação</InputLabel>
                  <Select
                    labelId="movement-type-label"
                    name="movement_type"
                    value={currentMovement.movement_type}
                    label="Tipo de Movimentação"
                    onChange={handleInputChange}
                    disabled={editMode}
                  >
                    <MenuItem value="in">Entrada de estoque</MenuItem>
                    <MenuItem value="out">Saída de estoque</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Quantidade"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={currentMovement.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                  disabled={editMode}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="unit_price"
                  label="Valor Unitário"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={currentMovement.unit_price}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="reference"
                  label="Referência (Nota fiscal, pedido, etc)"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={currentMovement.reference}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="notes"
                  label="Observações"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={currentMovement.notes}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
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

export default StockMovements;