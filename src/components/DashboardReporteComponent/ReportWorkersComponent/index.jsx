import React, { useState } from "react";
import DrawerComponent from "../../DrawerComponent";
import { useQuery } from "react-query";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import trabajadoresService from "../../../async/services/get/trabajadoresService";
import getTrabajadorByIdService from "../../../async/services/get/getTrabajadorByIdService";

function ReportWorkersComponent() {
  const { data, isLoading } = useQuery("workers", trabajadoresService);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [activeSection, setActiveSection] = useState("");

  const {
    data: trabajadorSeleccionado,
    isLoading: loadingWorker,
    error: errorWorker,
  } = useQuery(
    ["trabajadorById", selectedWorker],
    () => getTrabajadorByIdService(selectedWorker),
    {
      enabled: !!selectedWorker,
    }
  );

  const renderCompras = () => (
    <Box sx={{ mt: 3, width: "100%", maxWidth: 800 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista de Compras
      </Typography>
      <Stack spacing={2}>
        {trabajadorSeleccionado.compras.map((c) => (
          <Card key={c.id_detalle} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Producto: {c.producto.nombre}
              </Typography>
              <Typography>Proveedor: {c.proveedor.nombre}</Typography>
              <Typography>Cantidad: {c.subCantidad}</Typography>
              <Typography>Precio Unitario: Bs. {c.precio_unitario}</Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha: {new Date(c.fecha_compra).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderVentas = () => (
    <Box sx={{ mt: 3, width: "100%", maxWidth: 800 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista de Ventas
      </Typography>
      <Stack spacing={2}>
        {trabajadorSeleccionado.ventas.map((v) => (
          <Card key={v.id_venta} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Cliente: {v.cliente.nombre}
              </Typography>
              <Typography>Total: Bs. {v.total}</Typography>
              <Typography>Método de pago: {v.metodo_pago}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Detalles:
              </Typography>
              {v.detallesVenta.map((d) => (
                <Typography key={d.id_detalle} sx={{ ml: 1 }}>
                  - {d.producto.nombre} x {d.subCantidad} (Bs.{" "}
                  {d.precio_unitario})
                </Typography>
              ))}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Fecha: {new Date(v.fecha_venta).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderMovimientos = () => (
    <Box sx={{ mt: 3, width: "100%", maxWidth: 800 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista de Movimientos
      </Typography>
      <Stack spacing={2}>
        {trabajadorSeleccionado.movimientos.map((m) => (
          <Card key={m.id_movimiento} variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Tipo: {m.tipo_movimiento}
              </Typography>
              <Typography>Producto: {m.producto.nombre}</Typography>
              <Typography>Cantidad: {m.cantidad}</Typography>
              <Typography>Lote: {m.lote}</Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha: {new Date(m.fecha_movimiento).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  return (
    <DrawerComponent>
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Reporte de Trabajadores
        </Typography>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Seleccionar trabajador</InputLabel>
            <Select
              value={selectedWorker}
              onChange={(e) => {
                setSelectedWorker(e.target.value);
                setActiveSection(""); // Reset vista al cambiar trabajador
              }}
              label="Seleccionar trabajador"
            >
              {data
                ?.filter((t) => t.estado)
                .map((t) => (
                  <MenuItem key={t.id_trabajador} value={t.id_trabajador}>
                    {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

        {loadingWorker && <CircularProgress sx={{ mt: 2 }} />}
        {errorWorker && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error al cargar datos del trabajador
          </Typography>
        )}

        {trabajadorSeleccionado && (
          <>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              {trabajadorSeleccionado.compras?.length > 0 && (
                <Button
                  variant={
                    activeSection === "compras" ? "contained" : "outlined"
                  }
                  color="primary"
                  onClick={() => setActiveSection("compras")}
                >
                  Compras ({trabajadorSeleccionado.compras.length})
                </Button>
              )}
              {trabajadorSeleccionado.ventas?.length > 0 && (
                <Button
                  variant={
                    activeSection === "ventas" ? "contained" : "outlined"
                  }
                  color="success"
                  onClick={() => setActiveSection("ventas")}
                >
                  Ventas ({trabajadorSeleccionado.ventas.length})
                </Button>
              )}
              {trabajadorSeleccionado.movimientos?.length > 0 && (
                <Button
                  variant={
                    activeSection === "movimientos" ? "contained" : "outlined"
                  }
                  color="warning"
                  onClick={() => setActiveSection("movimientos")}
                >
                  Movimientos ({trabajadorSeleccionado.movimientos.length})
                </Button>
              )}
            </Stack>

            {/* Render según botón seleccionado */}
            {activeSection === "compras" && renderCompras()}
            {activeSection === "ventas" && renderVentas()}
            {activeSection === "movimientos" && renderMovimientos()}
          </>
        )}
      </Box>
    </DrawerComponent>
  );
}

export default ReportWorkersComponent;
