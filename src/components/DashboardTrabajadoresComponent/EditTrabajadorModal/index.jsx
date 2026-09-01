import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import FormTrabajador from "../FormTrabajor";
import useStyles from "../dashboardTrabajadores.styles";
import trabajadorUpdateService from "../../../async/services/put/trabajadorUpdateService";
import sucursalesService from "../../../async/services/get/sucursalesService";
import rolService from "../../../async/services/get/rolService";
import permisosService from "../../../async/services/get/permisosService";

const emptyForm = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  cargo: "",
  fecha_contratacion: "",
  username: "",
  password: "",
  id_rol: 0,
  id_sucursal: "",
};

function EditTrabajadorModal({ open, trabajador, handleClose, onSaved }) {
  const classes = useStyles();
  const [formData, setFormData] = useState(emptyForm);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const { data: rol = [], refetch: refetchRol } = useQuery("rol", rolService);
  const { data: permisos = [] } = useQuery("permisos", permisosService);

  useEffect(() => {
    if (trabajador) {
      setFormData({
        nombre: trabajador.nombre || "",
        apellido_paterno: trabajador.apellido_paterno || "",
        apellido_materno: trabajador.apellido_materno || "",
        cargo: trabajador.cargo || "",
        fecha_contratacion: trabajador.fecha_contratacion
          ? String(trabajador.fecha_contratacion).slice(0, 10)
          : "",
        username: trabajador.username || "",
        password: "",
        id_rol: trabajador.id_rol || 0,
        id_sucursal: trabajador.id_sucursal || "",
      });
    }
  }, [trabajador]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation(trabajadorUpdateService, {
    onSuccess: () => {
      onSaved("Trabajador actualizado correctamente.");
      handleClose();
    },
    onError: (error) => {
      onSaved(error?.message || "No se pudo actualizar el trabajador.", "error");
    },
  });

  const handleSubmit = () => {
    const payload = {
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      cargo: formData.cargo,
      fecha_contratacion: formData.fecha_contratacion || null,
      username: formData.username,
      id_rol: formData.id_rol,
      id_sucursal: formData.id_sucursal || null,
    };
    if (formData.password) {
      payload.password = formData.password;
    }
    mutation.mutate({ id_trabajador: trabajador.id_trabajador, payload });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Editar trabajador</DialogTitle>
      <DialogContent>
        <FormTrabajador
          formData={formData}
          handleChange={handleChange}
          rol={rol}
          refetchRol={refetchRol}
          permisos={permisos}
          sucursales={sucursales}
          isEdit
          classes={classes}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTrabajadorModal;
