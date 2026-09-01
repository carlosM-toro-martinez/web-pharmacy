import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Select,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMutation, useQuery } from "react-query";
import useStyles from "./tableTrabajadores.styles";
import trabajadorDeleteServices from "../../async/services/delete/trabajadorDeleteServices";
import sucursalesService from "../../async/services/get/sucursalesService";
import trabajadorUpdateService from "../../async/services/put/trabajadorUpdateService";
import EditTrabajadorModal from "../DashboardTrabajadoresComponent/EditTrabajadorModal";

function TableTrabajadoresComponent({ trabajadores, onEdit, refetch }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);
  const [verDadosDeBaja, setVerDadosDeBaja] = useState(false);
  const [editTrabajador, setEditTrabajador] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);

  const deleteMutation = useMutation(trabajadorDeleteServices, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Trabajador dado de baja con éxito.",
        severity: "success",
      });
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation(trabajadorUpdateService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Trabajador actualizado.",
        severity: "success",
      });
      refetch();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error: ${error.message || error}`,
        severity: "error",
      });
    },
  });

  const handleMenuOpen = (event, trabajador) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrabajador(trabajador);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrabajador(null);
  };

  const handleDelete = () => {
    if (selectedTrabajador) {
      deleteMutation.mutate(selectedTrabajador.id_trabajador);
    }
    handleMenuClose();
  };

  const handleReactivar = () => {
    if (selectedTrabajador) {
      updateMutation.mutate({
        id_trabajador: selectedTrabajador.id_trabajador,
        payload: { estado: true },
      });
    }
    handleMenuClose();
  };

  const handleEditar = () => {
    if (selectedTrabajador) {
      setEditTrabajador(selectedTrabajador);
    }
    handleMenuClose();
  };

  const handleSucursalChange = (trabajador, idSucursal) => {
    updateMutation.mutate({
      id_trabajador: trabajador.id_trabajador,
      payload: { id_sucursal: idSucursal || null },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const trabajadoresFiltrados = trabajadores.filter((trabajador) =>
    verDadosDeBaja ? trabajador.estado === false : trabajador.estado === true
  );

  return (
    <Paper>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5, pb: 0 }}>
        <FormControlLabel
          control={
            <Switch
              checked={verDadosDeBaja}
              onChange={(e) => setVerDadosDeBaja(e.target.checked)}
            />
          }
          label="Ver dados de baja"
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Apellido Paterno
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Apellido Materno
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Fecha de Contratación
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Sucursal</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trabajadoresFiltrados.map((trabajador) => (
              <TableRow key={trabajador.id_trabajador}>
                <TableCell>{trabajador.nombre}</TableCell>
                <TableCell>{trabajador.apellido_paterno}</TableCell>
                <TableCell>{trabajador.apellido_materno}</TableCell>
                <TableCell>{trabajador.fecha_contratacion}</TableCell>
                <TableCell style={{ textTransform: "capitalize" }}>
                  {trabajador.rol?.nombre}
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={trabajador.id_sucursal || ""}
                    onChange={(e) =>
                      handleSucursalChange(trabajador, e.target.value)
                    }
                    displayEmpty
                    disabled={updateMutation.isLoading}
                  >
                    <MenuItem value="">Principal</MenuItem>
                    {sucursales.map((sucursal) => (
                      <MenuItem
                        key={sucursal.id_sucursal}
                        value={sucursal.id_sucursal}
                      >
                        {sucursal.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{trabajador.username}</TableCell>
                <TableCell sx={{ color: "green" }}>
                  {trabajador.estado ? "Activo" : "Inactivo"}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, trabajador)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleEditar}>Editar</MenuItem>
                    {selectedTrabajador?.estado ? (
                      <MenuItem onClick={handleDelete}>Dar de baja</MenuItem>
                    ) : (
                      <MenuItem onClick={handleReactivar}>Reactivar</MenuItem>
                    )}
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editTrabajador && (
        <EditTrabajadorModal
          open={Boolean(editTrabajador)}
          trabajador={editTrabajador}
          handleClose={() => setEditTrabajador(null)}
          onSaved={(message, severity = "success") => {
            setSnackbar({ open: true, message, severity });
            refetch();
          }}
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default TableTrabajadoresComponent;
