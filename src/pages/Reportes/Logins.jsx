import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import registroLoginService from "../../async/services/get/registroLoginService";
import { formatLapazDate } from "../../utils/dateUtils";

const haceNDias = (n) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  return fecha.toISOString().slice(0, 10);
};

const hoy = () => new Date().toISOString().slice(0, 10);

const initialFilters = {
  desde: haceNDias(7),
  hasta: hoy(),
  exito: "",
};

function LoginsReporte() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const {
    data: registros = [],
    isLoading,
    error,
  } = useQuery(
    ["reporte-logins", appliedFilters],
    () => registroLoginService(appliedFilters)
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
          Registro de inicios de sesión
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Inicios y cierres de sesión, exitosos y fallidos, del más reciente
          al más antiguo.
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
              name="exito"
              label="Resultado"
              value={filters.exito}
              onChange={handleChange}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Exitosos</MenuItem>
              <MenuItem value="false">Fallidos</MenuItem>
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
                {registros.length} intento(s) encontrado(s)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Acción</TableCell>
                    <TableCell>Resultado</TableCell>
                    <TableCell>Motivo</TableCell>
                    <TableCell>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registros.map((registro) => (
                    <TableRow key={registro.id_registro} hover>
                      <TableCell>
                        {formatLapazDate(registro.fecha, "datetime")}
                      </TableCell>
                      <TableCell>{registro.username}</TableCell>
                      <TableCell>{registro.nombre_completo || "-"}</TableCell>
                      <TableCell style={{ textTransform: "capitalize" }}>
                        {registro.tipo || "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            registro.accion === "logout"
                              ? "Cierre de sesión"
                              : "Inicio de sesión"
                          }
                          color={
                            registro.accion === "logout" ? "default" : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={registro.exito ? "Exitoso" : "Fallido"}
                          color={registro.exito ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>{registro.motivo_fallo || "-"}</TableCell>
                      <TableCell>{registro.ip || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!registros.length && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No hay registros para los filtros seleccionados.
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

export default LoginsReporte;
