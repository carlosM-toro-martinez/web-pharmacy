import React, { useState } from "react";
import { useQuery } from "react-query";
import MoreSalesService from "../../../../async/services/get/MoreSalesService";
import sucursalesService from "../../../../async/services/get/sucursalesService";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

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
  desde: primerDiaDelMes(),
  hasta: hoy(),
  id_sucursal: "",
};

function MostSoldProductsComponent() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const { data, isLoading, isError } = useQuery(
    ["mostSoldProducts", appliedFilters],
    () => MoreSalesService(appliedFilters)
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

  const productos = data?.productos ?? [];

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Productos más vendidos
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
            onClick={() => aplicarPreset({ desde: haceNDias(7), hasta: hoy() })}
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

      {isError ? (
        <Alert severity="error">
          Ocurrió un error al cargar los productos más vendidos.
        </Alert>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {productos.map((producto) => (
            <Grid item xs={12} md={6} lg={4} key={producto.id_producto}>
              <Card sx={{ borderLeft: "6px solid #4caf50", boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {producto.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[producto?.forma_farmaceutica, producto?.concentracion]
                      .filter(Boolean)
                      .join(" - ")}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Precio:</strong> Bs. {producto.precio}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stock:</strong> {producto.stock} unidades
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#4caf50", fontWeight: "bold" }}
                    >
                      {producto.totalUnidadesVendidas} unidades vendidas
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#4caf50", fontWeight: "bold" }}
                    >
                      {producto.totalVentas} venta(s) registrada(s)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!productos.length && (
            <Grid item xs={12}>
              <Alert severity="info">
                No hay ventas para los filtros seleccionados.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default MostSoldProductsComponent;
