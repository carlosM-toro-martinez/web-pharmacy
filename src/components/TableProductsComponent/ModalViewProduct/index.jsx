import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import productosInventarioService from "../../../async/services/get/productosInventarioService";
import { useMutation, useQuery } from "react-query";

function ModalViewProduct({
  handleClose,
  product,
  editingRow,
  setEditingRow,
  editedPrice,
  setEditedPrice,
  mutate,
  mutateDelete,
}) {
  const { data, isLoading, error, refetch } = useQuery(
    `InventarioProducts`,
    () => productosInventarioService(product?.id_producto),
    {
      enabled: !!product?.id_producto,
    }
  );

  if (isLoading) {
    return (
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Ver Producto</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">
            Ocurrió un error al cargar los inventarios. Por favor, intenta de
            nuevo.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data) {
    return null;
  }
  const handleEdit = (index, precioActual) => {
    setEditingRow(index);
    setEditedPrice(precioActual);
  };

  const handleSave = (index) => {
    const item = data.inventarios[index].detalleCompra.id_detalle;

    if (item && editedPrice) {
      mutate({ id: item, updatedPrice: parseFloat(editedPrice) });
    }
    setEditingRow(null);
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedPrice("");
  };

  const handleDelete = (inventario, index) => {
    const dataDelete = {
      id_producto: inventario.detalleCompra.id_producto,
      id_lote: inventario.id_lote,
      id_inventario: inventario.id_inventario || null,
      id_movimiento: inventario.id_movimiento || null,
      id_detalle: inventario.detalleCompra.id_detalle,
      cantidad: inventario.cantidad,
      subCantidad: inventario.subCantidad,
      peso: parseFloat(inventario.peso) || 0,
    };

    mutateDelete({
      dataDelete,
      idDetalle: inventario.detalleCompra.id_detalle,
    });
  };

  function calcularUtilidad(cantidad, precioTotalCompra, precioVentaUnidad) {
    if (cantidad <= 0) {
      console.warn("La cantidad debe ser mayor que cero");
      return 0;
    }
    const costoUnitario = precioTotalCompra / cantidad;
    const utilidadUnidad = precioVentaUnidad - costoUnitario;
    const utilidadTotal = utilidadUnidad * cantidad;
    const utilidadUnidad2decimales = Number(utilidadUnidad.toFixed(2));
    return utilidadUnidad2decimales;
  }

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "70rem",
          maxWidth: "none",
        },
      }}
    >
      <DialogTitle>Lotes</DialogTitle>
      <DialogContent>
        <Typography
          variant="h6"
          style={{
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Producto: {data.producto}
        </Typography>
        <TableContainer component={Paper} style={{ marginTop: "1rem" }}>
          <Table>
            <TableHead style={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>
                  Número de Lote
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Cantidad (c/p)
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  cant. por caja
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Unidades</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Utilidades p(u)
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Precio de venta(u)
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Caducidad</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Ingreso</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Precio de compra(c)
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.inventarios.map((inventario, index) => (
                <TableRow key={index}>
                  <TableCell>{inventario.numero_lote}</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    {inventario.cantidad > 0 && inventario.subCantidad === 0
                      ? inventario.subCantidad
                      : inventario.cantidad}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {inventario.cantidadPorCaja
                      ? inventario.cantidadPorCaja
                      : 0}
                  </TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {inventario.cantidad > 0 && inventario.subCantidad === 0
                      ? inventario.cantidad
                      : inventario.subCantidad}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "green" }}>
                    {calcularUtilidad(
                      inventario.detalleCompra.cantidad *
                        inventario.cantidadPorCaja,
                      inventario.detalleCompra.precio_unitario *
                        inventario.detalleCompra.cantidad,
                      inventario.precioVenta
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {inventario.precioVenta ? inventario.precioVenta : 0}
                  </TableCell>

                  <TableCell sx={{ color: "orange" }}>
                    {inventario?.fecha_caducidad
                      ?.split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/")}
                  </TableCell>
                  <TableCell>
                    {inventario?.fecha_ingreso
                      ?.split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/")}
                  </TableCell>
                  <TableCell>
                    {editingRow === index ? (
                      <TextField
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        type="number"
                        variant="outlined"
                        size="small"
                        sx={{ width: "8rem" }}
                      />
                    ) : (
                      inventario.detalleCompra.precio_unitario
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === index ? (
                      <Box style={{ display: "flex", gap: 1 }}>
                        <Button
                          onClick={() => handleSave(index)}
                          size="small"
                          variant="contained"
                          sx={{
                            minWidth: 0,
                            width: "2rem",
                            bgcolor: "primary.main",
                            color: "#fff",
                            "&:hover": { bgcolor: "primary.dark" },
                          }}
                        >
                          <SaveIcon fontSize="small" />
                        </Button>

                        <Button
                          onClick={handleCancel}
                          size="small"
                          variant="contained"
                          sx={{
                            minWidth: 0,
                            width: "2rem",
                            bgcolor: "error.main",
                            color: "#fff",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </Button>
                      </Box>
                    ) : (
                      <Box style={{ display: "flex", gap: 1 }}>
                        <Button
                          onClick={() =>
                            handleEdit(
                              index,
                              inventario.detalleCompra.precio_unitario
                            )
                          }
                          size="small"
                          variant="contained"
                          sx={{
                            minWidth: 0,
                            width: "2rem",
                            bgcolor: "primary.main",
                            color: "#fff",
                            "&:hover": { bgcolor: "primary.dark" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </Button>

                        <Button
                          onClick={() => handleDelete(inventario, index)}
                          size="small"
                          variant="contained"
                          sx={{
                            minWidth: 0,
                            width: "2rem",
                            bgcolor: "error.main",
                            color: "#fff",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error" variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalViewProduct;
