import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DrawerComponent from "../../DrawerComponent";
import sucursalesService from "../../../async/services/get/sucursalesService";
import reportCajasService from "../../../async/services/get/reportCajasService.js";
import TableCajasReport from "./TableCajaReport";

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

const initialFilters = {
  desde: haceNDias(7),
  hasta: hoy(),
  id_sucursal: "",
};

function ReportCajaComponent() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const {
    data: reportData = [],
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(["reporte-cajas", appliedFilters], () =>
    reportCajasService(appliedFilters)
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

  const aplicarPreset = (nuevosFiltros) => {
    const combinado = { ...filters, ...nuevosFiltros };
    setFilters(combinado);
    setAppliedFilters(combinado);
  };

  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Reporte de cajas
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Aperturas y cierres de caja, de la más reciente a la más antigua.
        </Typography>

        <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "flex-end" }}
            flexWrap="wrap"
            useFlexGap
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
            <Button
              type="button"
              onClick={() => aplicarPreset({ desde: hoy(), hasta: hoy() })}
            >
              Hoy
            </Button>
            <Button
              type="button"
              onClick={() =>
                aplicarPreset({ desde: haceNDias(7), hasta: hoy() })
              }
            >
              Última semana
            </Button>
            <Button
              type="button"
              onClick={() =>
                aplicarPreset({ desde: primerDiaDelMes(), hasta: hoy() })
              }
            >
              Este mes
            </Button>
          </Stack>
        </Paper>

        {reportError ? (
          <Alert severity="error">No se pudo cargar el reporte.</Alert>
        ) : isLoadingReport ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableCajasReport reportData={reportData} />
        )}
      </Box>
    </DrawerComponent>
  );
}

export default ReportCajaComponent;
