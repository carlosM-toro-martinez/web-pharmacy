import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Snackbar } from "@mui/material";
import { useMutation } from "react-query";
import Alert from "@mui/material/Alert";
import useStyles from "./formProveedor.styles";
import proveedorAddServices from "../../async/services/post/proveedorAddServices";
import proveedorUpdateService from "../../async/services/put/proveedorUpdateService";

function FormProveedor({ handleClose, refetchProveedores, proveedorAEditar }) {
  const classes = useStyles();
  const esEdicion = Boolean(proveedorAEditar?.id_proveedor);
  const [proveedor, setProveedor] = useState({
    nombre: proveedorAEditar?.nombre || "",
    telefono: proveedorAEditar?.telefono || "",
    email: proveedorAEditar?.email || "",
    direccion: proveedorAEditar?.direccion || "",
    nitci: proveedorAEditar?.nitci || "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    setProveedor({
      ...proveedor,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const mutation = useMutation(
    esEdicion
      ? (payload) =>
          proveedorUpdateService({
            id_proveedor: proveedorAEditar.id_proveedor,
            ...payload,
          })
      : proveedorAddServices,
    {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: esEdicion
            ? "Proveedor actualizado exitosamente!"
            : "Proveedor creado exitosamente!",
          severity: "success",
        });
        handleClose();
        refetchProveedores();
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: `Error al ${esEdicion ? "actualizar" : "crear"} el proveedor: ${
            error.message
          }`,
          severity: "error",
        });
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(proveedor);
  };

  return (
    <>
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography variant="h6" className={classes.title}>
          {esEdicion ? "Editar Proveedor" : "Crear Proveedor"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              name="nombre"
              value={proveedor.nombre}
              onChange={handleChange}
              fullWidth
              required
              className={classes.input}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="NIT/CI"
              name="nitci"
              value={proveedor.nitci}
              onChange={handleChange}
              fullWidth
              className={classes.input}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Teléfono"
              name="telefono"
              value={proveedor.telefono}
              onChange={handleChange}
              fullWidth
              className={classes.input}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              value={proveedor.email}
              onChange={handleChange}
              fullWidth
              className={classes.input}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Dirección"
              name="direccion"
              value={proveedor.direccion}
              onChange={handleChange}
              fullWidth
              className={classes.input}
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="error"
              className={classes.button}
              disabled={mutation.isLoading}
              onClick={handleClose}
            >
              Cancelar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading
                ? esEdicion
                  ? "Guardando..."
                  : "Creando..."
                : esEdicion
                ? "Guardar Cambios"
                : "Crear Proveedor"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default FormProveedor;
