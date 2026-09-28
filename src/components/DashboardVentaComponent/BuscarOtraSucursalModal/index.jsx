import React, { useContext, useDeferredValue, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "react-query";
import buscarStockSucursalesService from "../../../async/services/get/buscarStockSucursalesService";
import { MainContext } from "../../../context/MainContext";

const getDetalleProducto = (producto) =>
  [producto.concentracion, producto.forma_farmaceutica]
    .filter(Boolean)
    .join(" | ");

function BuscarOtraSucursalModal({ open, handleClose }) {
  const { sucursal } = useContext(MainContext);
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda);

  const busquedaValida = busquedaDiferida.trim().length >= 2;

  const { data: resultados = [], isFetching } = useQuery(
    ["buscar-stock-sucursales", busquedaDiferida, sucursal?.id_sucursal],
    () =>
      buscarStockSucursalesService(busquedaDiferida.trim(), sucursal?.id_sucursal),
    { enabled: busquedaValida, keepPreviousData: true, staleTime: 0 }
  );

  const handleCerrar = () => {
    setBusqueda("");
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCerrar}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { minHeight: "60vh" } }}
    >
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Buscar en otra sucursal
        <IconButton onClick={handleCerrar} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nombre o codigo de barra"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />

        {!busquedaValida ? (
          <Alert severity="info">Escribe al menos 2 letras para buscar.</Alert>
        ) : isFetching ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : resultados.length === 0 ? (
          <Alert severity="warning">
            No se encontro stock de &ldquo;{busqueda}&rdquo; en otras sucursales.
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            {resultados.map((producto) => (
              <Box
                key={producto.id_producto}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {producto.nombre}
                </Typography>
                {getDetalleProducto(producto) && (
                  <Typography variant="caption" color="text.secondary">
                    {getDetalleProducto(producto)}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    mt: 0.3,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Codigo: {producto.codigo_barra || "Sin codigo"}
                  </Typography>
                  {producto.precioVenta != null && (
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {producto.precioVenta.toFixed(2)} Bs.
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                  {producto.sucursales.map((s) => (
                    <Chip
                      key={s.id_sucursal}
                      label={
                        <span>
                          {s.nombre}:{" "}
                          <strong style={{ fontSize: "1.05rem" }}>
                            {s.subCantidad}
                          </strong>{" "}
                          u.
                        </span>
                      }
                      color={s.subCantidad > 0 ? "success" : "default"}
                      variant="outlined"
                      size="small"
                      sx={{ height: "auto", py: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BuscarOtraSucursalModal;
