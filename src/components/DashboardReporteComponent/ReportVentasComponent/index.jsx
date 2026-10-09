import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
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
import inventarioService from "../../../async/services/get/inventarioService.js";
import ProductoAutocompleteComponent from "../../DashboardVentaComponent/VentaForm/ProductoAutocompleteComponent";
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
  id_producto: "",
};

function ReportVentasComponent() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [modoResumen, setModoResumen] = useState("ventas");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const {
    data: reportData = [],
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(["reporte-ventas", appliedFilters], () =>
    reportVentasService(appliedFilters)
  );

  // Mismo autocomplete (y mismo endpoint) que se usa para elegir el
  // producto al hacer una venta, en vez de un buscador de texto aparte.
  const { data: productosInventario = [] } = useQuery(
    ["inventario-para-buscar-ventas", filters.id_sucursal],
    () => inventarioService(filters.id_sucursal || null)
  );

  const productosConTotales = useMemo(() => {
    const porProducto = new Map();
    for (const producto of productosInventario) {
      if (porProducto.has(producto.id_producto)) continue;
      const inventarios = producto.inventarios || [];
      const totalSubCantidad = inventarios.reduce(
        (total, inv) => total + (Number(inv.subCantidad) || 0),
        0
      );
      porProducto.set(producto.id_producto, {
        ...producto,
        inventarios,
        totalSubCantidad,
      });
    }
    return Array.from(porProducto.values());
  }, [productosInventario]);

  const handleChange = (event) => {
    setFilters((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleProductoChange = (idProducto, producto) => {
    setProductoSeleccionado(producto || null);
    const combinado = { ...filters, id_producto: idProducto };
    setFilters(combinado);
    setAppliedFilters(combinado);
  };

  const handleQuitarProducto = () => {
    setProductoSeleccionado(null);
    const combinado = { ...filters, id_producto: "" };
    setFilters(combinado);
    setAppliedFilters(combinado);
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
            <Box sx={{ minWidth: 260 }}>
              <ProductoAutocompleteComponent
                productosUnicosFiltrados={productosConTotales}
                productosConTotales={productosConTotales}
                handleProductoChange={handleProductoChange}
                setCantidad={() => {}}
                setCantidadPorUnidad={() => {}}
              />
            </Box>
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
            <Button
              type="button"
              onClick={() => aplicarPreset({ desde: "", hasta: "" })}
            >
              Todo el historial
            </Button>
          </Stack>
          {productoSeleccionado && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Producto: ${productoSeleccionado.nombre}`}
                onDelete={handleQuitarProducto}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}
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
