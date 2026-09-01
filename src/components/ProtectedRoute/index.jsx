import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { MainContext } from "../../context/MainContext";

const ProtectedRoute = ({ allowedPermissions = [] }) => {
  const { token, user, superAdmin } = useContext(MainContext);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (superAdmin) {
    return <Outlet />;
  }
  if (user) {
    const userRole = user?.rol?.nombre?.toLowerCase();
    const isAdministrator = userRole === "administrador";

    if (isAdministrator) {
      return <Outlet />;
    }

    const userPermissions =
      user?.rol?.permisos?.map((permiso) => permiso.nombre) || [];

    // Sin permisos indicados = cualquier trabajador logueado puede entrar
    // (solo exige estar logueado, no un permiso especifico).
    const hasPermission =
      allowedPermissions.length === 0 ||
      allowedPermissions.some((permiso) => userPermissions.includes(permiso));

    if (hasPermission) {
      return <Outlet />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
