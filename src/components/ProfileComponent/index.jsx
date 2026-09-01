import React, { useContext, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useMutation } from "react-query";
import useStyles from "./profile.styles";
import { MainContext } from "../../context/MainContext";
import background from "../../assets/images/moneda.jpg";
import { formatLapazDate } from "../../utils/dateUtils";
import changePasswordService from "../../async/services/put/changePasswordService";

const ProfileComponent = () => {
  const { user } = useContext(MainContext);
  const classes = useStyles();

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const changePasswordMutation = useMutation(changePasswordService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Contraseña actualizada correctamente.",
        severity: "success",
      });
      setOpenPasswordDialog(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err?.message || "No se pudo actualizar la contraseña.",
        severity: "error",
      });
    },
  });

  const handlePasswordFieldChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSubmitPasswordChange = (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: "La nueva contraseña y su confirmación no coinciden.",
        severity: "error",
      });
      return;
    }
    changePasswordMutation.mutate({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <Paper elevation={3} className={classes.root}>
      <Box className={classes.coverPhotoContainer}>
        <img src={background} alt="Cover" className={classes.coverPhoto} />
      </Box>

      <Box className={classes.profileInfo}>
        <Typography variant="h4" className={classes.name}>
          {user.nombre} {user.apellido_paterno} {user.apellido_materno}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user.cargo}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Fecha de Contratación:{" "}
          {formatLapazDate(user.fecha_contratacion, "date")}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Username: {user.username}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Rol: {user.rol.nombre}
        </Typography>
        <Divider className={classes.divider} />

        <Typography variant="h6" className={classes.sectionTitle}>
          Permisos
        </Typography>
        <ul className={classes.permissionsList}>
          {user.rol.permisos.map((permiso) => (
            <li key={permiso.id_permiso} className={classes.permissionItem}>
              {permiso.nombre}
            </li>
          ))}
        </ul>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="primary" className={classes.button}>
            Editar Perfil
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={() => setOpenPasswordDialog(true)}
          >
            Cambiar contraseña
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleSubmitPasswordChange}>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogContent
            sx={{ display: "grid", gap: 2, mt: 1 }}
          >
            <TextField
              label="Contraseña actual"
              type="password"
              size="small"
              value={passwordForm.oldPassword}
              onChange={handlePasswordFieldChange("oldPassword")}
              required
              autoFocus
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              size="small"
              value={passwordForm.newPassword}
              onChange={handlePasswordFieldChange("newPassword")}
              required
              helperText="Mínimo 4 caracteres"
            />
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              size="small"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFieldChange("confirmPassword")}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={changePasswordMutation.isLoading}
            >
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileComponent;
