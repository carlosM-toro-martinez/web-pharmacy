import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DrawerComponent from "../../components/DrawerComponent";
import { useQuery } from "react-query";
import sucursalesService from "../../async/services/get/sucursalesService";
import transferenciasReporteService from "../../async/services/get/transferenciasReporteService";
import ProductoCellComponent from "../../components/ProductoCellComponent";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(new Date(value));
};

function TransferenciasReporte() {
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    id_sucursal_origen: "",
    id_sucursal_destino: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const { data: transferencias = [], isLoading, error, refetch } = useQuery(
    ["reporte-transferencias", appliedFilters],
    () => transferenciasReporteService(appliedFilters)
  );

  const handleChange = (event) => {
    setFilters((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    const emptyFilters = {
      desde: "",
      hasta: "",
      id_sucursal_origen: "",
      id_sucursal_destino: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Transferencias entre sucursales
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Historial de productos y unidades enviadas de una sucursal a otra.
        </Typography>

        <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "flex-end" }}
          >
            <TextField
              name="desde"
              label="Desde"
              type="date"
              value={filters.desde}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              name="hasta"
              label="Hasta"
              type="date"
              value={filters.hasta}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              select
              name="id_sucursal_origen"
              label="Sucursal origen"
              value={filters.id_sucursal_origen}
              onChange={handleChange}
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
              name="id_sucursal_destino"
              label="Sucursal destino"
              value={filters.id_sucursal_destino}
              onChange={handleChange}
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
            <Button type="submit" variant="contained" startIcon={<RefreshIcon />}>
              Buscar
            </Button>
            <Button type="button" onClick={handleClear}>
              Limpiar
            </Button>
          </Stack>
        </Paper>

        {error ? (
          <Alert severity="error">No se pudo cargar el reporte.</Alert>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography fontWeight={700}>
                {transferencias.length} transferencia(s) encontrada(s)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell align="right">Unidades</TableCell>
                    <TableCell>Registrado por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transferencias.map((transferencia) => {
                    const trabajador =
                      transferencia.trabajadorMovimientoInventario;
                    return (
                      <TableRow key={transferencia.id_movimiento} hover>
                        <TableCell>{formatDate(transferencia.fecha_movimiento)}</TableCell>
                        <TableCell>
                          <ProductoCellComponent
                            nombre={transferencia.producto?.nombre}
                            concentracion={transferencia.producto?.concentracion}
                            forma_farmaceutica={
                              transferencia.producto?.forma_farmaceutica
                            }
                          />
                        </TableCell>
                        <TableCell>{transferencia.producto?.codigo_barra || "-"}</TableCell>
                        <TableCell>{transferencia.sucursal?.nombre || "-"}</TableCell>
                        <TableCell>{transferencia.sucursalDestino?.nombre || "-"}</TableCell>
                        <TableCell align="right">{transferencia.subCantidad || 0}</TableCell>
                        <TableCell>
                          {trabajador
                            ? `${trabajador.nombre || ""} ${trabajador.apellido_paterno || ""}`.trim()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!transferencias.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay transferencias para los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </DrawerComponent>
  );
}

export default TransferenciasReporte;
