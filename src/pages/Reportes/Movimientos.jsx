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
import movimientosReporteService from "../../async/services/get/movimientosReporteService";
import { formatLapazDate } from "../../utils/dateUtils";
import ProductoCellComponent from "../../components/ProductoCellComponent";

const haceNDias = (n) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  return fecha.toISOString().slice(0, 10);
};

const hoy = () => new Date().toISOString().slice(0, 10);

const initialFilters = {
  desde: haceNDias(7),
  hasta: hoy(),
  id_sucursal: "",
};

function MovimientosReporte() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const {
    data: movimientos = [],
    isLoading,
    error,
  } = useQuery(
    ["reporte-movimientos", appliedFilters],
    () => movimientosReporteService(appliedFilters)
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
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Movimientos de inventario
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Salidas manuales de inventario (mermas, ajustes, pérdidas), del más
          reciente al más antiguo. Compras, ventas y transferencias tienen su
          propio reporte.
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
              name="id_sucursal"
              label="Sucursal"
              value={filters.id_sucursal}
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
              Ultima semana
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
                {movimientos.length} movimiento(s) encontrado(s)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Unidades</TableCell>
                    <TableCell>Registrado por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((movimiento) => {
                    const trabajador =
                      movimiento.trabajadorMovimientoInventario;
                    return (
                      <TableRow key={movimiento.id_movimiento} hover>
                        <TableCell>
                          {formatLapazDate(movimiento.fecha_movimiento, "datetime")}
                        </TableCell>
                        <TableCell>
                          <ProductoCellComponent
                            nombre={movimiento.producto?.nombre}
                            concentracion={movimiento.producto?.concentracion}
                            forma_farmaceutica={
                              movimiento.producto?.forma_farmaceutica
                            }
                          />
                        </TableCell>
                        <TableCell>{movimiento.sucursal?.nombre || "-"}</TableCell>
                        <TableCell align="right">
                          {movimiento.cantidad || 0}
                        </TableCell>
                        <TableCell align="right">
                          {movimiento.subCantidad || 0}
                        </TableCell>
                        <TableCell>
                          {trabajador
                            ? `${trabajador.nombre || ""} ${
                                trabajador.apellido_paterno || ""
                              }`.trim()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!movimientos.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay movimientos para los filtros seleccionados.
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

export default MovimientosReporte;
