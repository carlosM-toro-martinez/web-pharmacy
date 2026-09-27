import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  IconButton,
  Chip,
  Box,
  Snackbar,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useMutation } from "react-query";
import FormProveedor from "../FormProveedorComponent";
import proveedorDeleteService from "../../async/services/delete/proveedorDeleteService";
import proveedorUpdateService from "../../async/services/put/proveedorUpdateService";

const ProveedoresManagerModal = ({ open, handleClose, proveedores, refetchProveedores }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const abrirCrear = () => {
    setProveedorAEditar(null);
    setFormOpen(true);
  };

  const abrirEditar = (proveedor) => {
    setProveedorAEditar(proveedor);
    setFormOpen(true);
  };

  const bajaMutation = useMutation(proveedorDeleteService, {
    onSuccess: () => {
      setSnackbar({ open: true, message: "Proveedor dado de baja.", severity: "success" });
      refetchProveedores();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `No se pudo dar de baja: ${error.message}`,
        severity: "error",
      });
    },
  });

  const reactivarMutation = useMutation(proveedorUpdateService, {
    onSuccess: () => {
      setSnackbar({ open: true, message: "Proveedor reactivado.", severity: "success" });
      refetchProveedores();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `No se pudo reactivar: ${error.message}`,
        severity: "error",
      });
    },
  });

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Proveedores
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear}>
              Nuevo proveedor
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>NIT/CI</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Teléfono</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Dirección</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(proveedores || []).map((proveedor) => {
                  const activo = proveedor.activo !== false;
                  return (
                    <TableRow key={proveedor.id_proveedor}>
                      <TableCell>{proveedor.nombre}</TableCell>
                      <TableCell>{proveedor.nitci}</TableCell>
                      <TableCell>{proveedor.telefono}</TableCell>
                      <TableCell>{proveedor.email}</TableCell>
                      <TableCell>{proveedor.direccion}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={activo ? "Activo" : "Dado de baja"}
                          color={activo ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => abrirEditar(proveedor)}
                          title="Editar"
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        {activo ? (
                          <IconButton
                            size="small"
                            color="error"
                            title="Dar de baja"
                            disabled={bajaMutation.isLoading}
                            onClick={() => bajaMutation.mutate(proveedor.id_proveedor)}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            color="success"
                            title="Reactivar"
                            disabled={reactivarMutation.isLoading}
                            onClick={() =>
                              reactivarMutation.mutate({
                                id_proveedor: proveedor.id_proveedor,
                                activo: true,
                              })
                            }
                          >
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!proveedores?.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aún no hay proveedores registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <FormProveedor
            handleClose={() => setFormOpen(false)}
            refetchProveedores={refetchProveedores}
            proveedorAEditar={proveedorAEditar}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default ProveedoresManagerModal;
