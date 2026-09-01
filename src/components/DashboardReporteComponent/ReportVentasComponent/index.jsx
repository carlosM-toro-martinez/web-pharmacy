import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
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
import reportVentasService from "../../../async/services/get/reportVentasService.js";
import TableVentasReport from "./TableVentasReport";
import VentasResumeTable from "./VentasResumeTable";

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

function ReportVentasComponent() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [modoResumen, setModoResumen] = useState("ventas");

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const {
    data: reportData = [],
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(["reporte-ventas", appliedFilters], () =>
    reportVentasService(appliedFilters)
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
          Reporte de ventas
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ventas registradas, de la más reciente a la más antigua.
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

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ButtonGroup variant="outlined" color="primary">
            <Button
              onClick={() => setModoResumen("ventas")}
              variant={modoResumen === "ventas" ? "contained" : "outlined"}
            >
              Ver resumen por ventas
            </Button>
            <Button
              onClick={() => setModoResumen("productos")}
              variant={modoResumen === "productos" ? "contained" : "outlined"}
            >
              Ver resumen por producto
            </Button>
          </ButtonGroup>
        </Box>

        {reportError ? (
          <Alert severity="error">No se pudo cargar el reporte.</Alert>
        ) : isLoadingReport ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : modoResumen === "ventas" ? (
          <TableVentasReport reportData={reportData} />
        ) : (
          <VentasResumeTable data={reportData} />
        )}
      </Box>
    </DrawerComponent>
  );
}

export default ReportVentasComponent;
