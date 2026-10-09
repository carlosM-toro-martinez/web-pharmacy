import React, { useState } from "react";
import DrawerComponent from "../../DrawerComponent";
import { formatLapazDate } from "../../../utils/dateUtils";
import { useQuery } from "react-query";
import {
  Alert,
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
  Paper,
  TextField,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import trabajadoresService from "../../../async/services/get/trabajadoresService";
import getTrabajadorByIdService from "../../../async/services/get/getTrabajadorByIdService";
import sucursalesService from "../../../async/services/get/sucursalesService";
import reportVentasPorTrabajadorService from "../../../async/services/get/reportVentasPorTrabajadorService";
import generarExcelVentasPorTrabajador from "./generarExcelVentasPorTrabajador";

const haceNDias = (n) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  return fecha.toISOString().slice(0, 10);
};

const primerDiaDelMes = () => {
  const fecha = new Date();
  fecha.setDate(1);
  return fecha.toISOString().slice(0, 10);
};

const hoy = () => new Date().toISOString().slice(0, 10);

function ReportWorkersComponent() {
  const { data, isLoading } = useQuery("workers", trabajadoresService);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [activeSection, setActiveSection] = useState("");

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const [excelFilters, setExcelFilters] = useState({
    desde: primerDiaDelMes(),
    hasta: hoy(),
    id_sucursal: "",
    id_trabajador: "",
  });
  const [generandoExcel, setGenerandoExcel] = useState(false);
  const [errorExcel, setErrorExcel] = useState("");

  const handleExcelFilterChange = (event) => {
    setErrorExcel("");
    setExcelFilters((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDescargarExcel = async () => {
    setGenerandoExcel(true);
    setErrorExcel("");
    try {
      const reporte = await reportVentasPorTrabajadorService(excelFilters);
      if (!reporte.trabajadores?.length) {
        setErrorExcel("No hay ventas registradas en el rango seleccionado.");
        return;
      }
      await generarExcelVentasPorTrabajador(reporte);
    } catch (error) {
      setErrorExcel(
        `No se pudo generar el Excel: ${error?.message || "Intente nuevamente."}`
      );
    } finally {
      setGenerandoExcel(false);
    }
  };

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
                Fecha: {formatLapazDate(c.fecha_compra, "datetime")}
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
                Fecha: {formatLapazDate(v.fecha_venta, "datetime")}
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
                Fecha: {formatLapazDate(m.fecha_movimiento, "datetime")}
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

        <Paper sx={{ p: 2, mb: 4, width: "100%", maxWidth: 800 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Exportar ventas por trabajador (Excel)
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Descarga un Excel con el desglose de ventas producto por
            producto (con precio de venta) de cada trabajador en el rango
            de fechas elegido, con el total por trabajador y el total
            general. Filtra por un trabajador puntual si solo necesitas
            el de uno.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "flex-end" }}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              name="desde"
              label="Desde"
              type="date"
              value={excelFilters.desde}
              onChange={handleExcelFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              name="hasta"
              label="Hasta"
              type="date"
              value={excelFilters.hasta}
              onChange={handleExcelFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              select
              name="id_sucursal"
              label="Sucursal"
              value={excelFilters.id_sucursal}
              onChange={handleExcelFilterChange}
              size="small"
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {sucursales.map((sucursal) => (
                <MenuItem key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                  {sucursal.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="id_trabajador"
              label="Trabajador"
              value={excelFilters.id_trabajador}
              onChange={handleExcelFilterChange}
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {data
                ?.filter((t) => t.estado)
                .map((t) => (
                  <MenuItem key={t.id_trabajador} value={t.id_trabajador}>
                    {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                  </MenuItem>
                ))}
            </TextField>
            <Button
              variant="outlined"
              onClick={() =>
                setExcelFilters((prev) => ({ ...prev, desde: hoy(), hasta: hoy() }))
              }
            >
              Hoy
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setExcelFilters((prev) => ({
                  ...prev,
                  desde: haceNDias(7),
                  hasta: hoy(),
                }))
              }
            >
              Última semana
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setExcelFilters((prev) => ({
                  ...prev,
                  desde: primerDiaDelMes(),
                  hasta: hoy(),
                }))
              }
            >
              Este mes
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                generandoExcel ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />
              }
              onClick={handleDescargarExcel}
              disabled={generandoExcel}
            >
              {generandoExcel ? "Generando..." : "Descargar Excel"}
            </Button>
          </Stack>
          {errorExcel && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorExcel}
            </Alert>
          )}
        </Paper>

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
