import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  CircularProgress,
  IconButton,
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
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import DrawerComponent from "../../DrawerComponent";
import { useQuery } from "react-query";
import sucursalesService from "../../../async/services/get/sucursalesService";
import reportAlmacenesService from "../../../async/services/get/reportAlmacenesService";
import { formatLapazDate } from "../../../utils/dateUtils";
import ProductoCellComponent from "../../ProductoCellComponent";

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
  numero_factura: "",
};

const gruposOpciones = [
  { value: "ninguno", label: "Sin agrupar" },
  { value: "factura", label: "N° de factura" },
  { value: "distribuidora", label: "Distribuidora" },
  { value: "trabajador", label: "Registrado por" },
];

const nombreTrabajador = (t) =>
  t ? `${t.nombre || ""} ${t.apellido_paterno || ""}`.trim() || "-" : "-";

function CompraRow({ compra, sucursales, totalRow }) {
  const lote = compra.lotes?.[0];
  const sucursalLote =
    lote?.inventarios?.[0]?.id_sucursal != null
      ? sucursales.find((s) => s.id_sucursal === lote.inventarios[0].id_sucursal)
          ?.nombre
      : null;
  const trabajador = compra.trabajadorCompra;

  return (
    <TableRow hover>
      <TableCell>{formatLapazDate(compra.fecha_compra, "datetime")}</TableCell>
      <TableCell>
        <ProductoCellComponent
          nombre={compra.producto?.nombre}
          concentracion={compra.producto?.concentracion}
          forma_farmaceutica={compra.producto?.forma_farmaceutica}
        />
      </TableCell>
      <TableCell>{compra.proveedor?.nombre || "-"}</TableCell>
      <TableCell>{sucursalLote || "-"}</TableCell>
      <TableCell align="right">{compra.cantidad || 0}</TableCell>
      <TableCell align="right">
        {Number(compra.precio_unitario || 0).toFixed(2)}
      </TableCell>
      <TableCell align="right">{totalRow.toFixed(2)}</TableCell>
      <TableCell>{lote?.numero_lote || "-"}</TableCell>
      <TableCell>{nombreTrabajador(trabajador)}</TableCell>
    </TableRow>
  );
}

function GrupoRow({ grupo, sucursales }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover style={{ backgroundColor: "#e8f0fe" }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell style={{ fontWeight: 700 }}>{grupo.etiqueta}</TableCell>
        <TableCell align="right">{grupo.items.length} línea(s)</TableCell>
        <TableCell align="right" style={{ fontWeight: 700 }}>
          Bs. {grupo.total.toFixed(2)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio unit.</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Registrado por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupo.items.map((compra) => (
                    <CompraRow
                      key={compra.id_detalle}
                      compra={compra}
                      sucursales={sucursales}
                      totalRow={
                        (Number(compra.precio_unitario) || 0) *
                        (Number(compra.cantidad) || 0)
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function ReportAlmacenesComponent() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [agruparPor, setAgruparPor] = useState("ninguno");

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);
  const {
    data: compras = [],
    isLoading,
    error,
  } = useQuery(["reporte-compras", appliedFilters], () =>
    reportAlmacenesService(appliedFilters)
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

  const totalGastado = compras.reduce(
    (total, compra) =>
      total +
      (Number(compra.precio_unitario) || 0) * (Number(compra.cantidad) || 0),
    0
  );

  const grupos = useMemo(() => {
    if (agruparPor === "ninguno") return null;

    const mapa = new Map();
    for (const compra of compras) {
      let clave;
      let etiqueta;
      if (agruparPor === "factura") {
        clave = compra.numero_factura || "sin-numero";
        etiqueta = compra.numero_factura || "Sin número";
      } else if (agruparPor === "distribuidora") {
        clave = compra.proveedorFactura?.id_proveedor || "sin-distribuidora";
        etiqueta = compra.proveedorFactura?.nombre || "Sin distribuidora";
      } else {
        clave = compra.trabajadorCompra?.id_trabajador || "sin-trabajador";
        etiqueta = nombreTrabajador(compra.trabajadorCompra);
      }

      if (!mapa.has(clave)) {
        mapa.set(clave, { clave, etiqueta, items: [], total: 0 });
      }
      const grupo = mapa.get(clave);
      grupo.items.push(compra);
      grupo.total +=
        (Number(compra.precio_unitario) || 0) * (Number(compra.cantidad) || 0);
    }

    return Array.from(mapa.values()).sort(
      (a, b) =>
        new Date(b.items[0]?.fecha_compra || 0) -
        new Date(a.items[0]?.fecha_compra || 0)
    );
  }, [compras, agruparPor]);

  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Reporte de compras
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Compras registradas, de la más reciente a la más antigua.
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
            <TextField
              name="numero_factura"
              label="N° de factura"
              value={filters.numero_factura}
              onChange={handleChange}
              size="small"
              placeholder="Buscar factura..."
              sx={{ minWidth: 190 }}
            />
            <TextField
              select
              label="Agrupar por"
              value={agruparPor}
              onChange={(e) => setAgruparPor(e.target.value)}
              size="small"
              sx={{ minWidth: 190 }}
            >
              {gruposOpciones.map((opcion) => (
                <MenuItem key={opcion.value} value={opcion.value}>
                  {opcion.label}
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

        {error ? (
          <Alert severity="error">No se pudo cargar el reporte.</Alert>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography fontWeight={700}>
                {compras.length} compra(s) encontrada(s)
                {grupos ? ` en ${grupos.length} grupo(s)` : ""}
              </Typography>
              <Typography fontWeight={700} color="primary.main">
                Total: Bs. {totalGastado.toFixed(2)}
              </Typography>
            </Box>
            <TableContainer sx={{ overflowX: "auto" }}>
              {grupos ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell style={{ fontWeight: "bold" }}>
                        {
                          gruposOpciones.find((o) => o.value === agruparPor)
                            ?.label
                        }
                      </TableCell>
                      <TableCell align="right" style={{ fontWeight: "bold" }}>
                        Compras
                      </TableCell>
                      <TableCell align="right" style={{ fontWeight: "bold" }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grupos.map((grupo) => (
                      <GrupoRow
                        key={grupo.clave}
                        grupo={grupo}
                        sucursales={sucursales}
                      />
                    ))}
                    {!grupos.length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay compras para los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Proveedor</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Registrado por</TableCell>
                      <TableCell>Distribuidora</TableCell>
                      <TableCell>N° Factura</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compras.map((compra) => {
                      const lote = compra.lotes?.[0];
                      const sucursalLote =
                        lote?.inventarios?.[0]?.id_sucursal != null
                          ? sucursales.find(
                              (s) =>
                                s.id_sucursal ===
                                lote.inventarios[0].id_sucursal
                            )?.nombre
                          : null;
                      const trabajador = compra.trabajadorCompra;
                      const total =
                        (Number(compra.precio_unitario) || 0) *
                        (Number(compra.cantidad) || 0);
                      return (
                        <TableRow key={compra.id_detalle} hover>
                          <TableCell>
                            {formatLapazDate(compra.fecha_compra, "datetime")}
                          </TableCell>
                          <TableCell>
                            <ProductoCellComponent
                              nombre={compra.producto?.nombre}
                              concentracion={compra.producto?.concentracion}
                              forma_farmaceutica={
                                compra.producto?.forma_farmaceutica
                              }
                            />
                          </TableCell>
                          <TableCell>{compra.proveedor?.nombre || "-"}</TableCell>
                          <TableCell>{sucursalLote || "-"}</TableCell>
                          <TableCell align="right">
                            {compra.cantidad || 0}
                          </TableCell>
                          <TableCell align="right">
                            {Number(compra.precio_unitario || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{total.toFixed(2)}</TableCell>
                          <TableCell>{lote?.numero_lote || "-"}</TableCell>
                          <TableCell>{nombreTrabajador(trabajador)}</TableCell>
                          <TableCell>
                            {compra.proveedorFactura?.nombre || "-"}
                          </TableCell>
                          <TableCell>{compra.numero_factura || "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {!compras.length && (
                      <TableRow>
                        <TableCell colSpan={11} align="center">
                          No hay compras para los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Paper>
        )}
      </Box>
    </DrawerComponent>
  );
}

export default ReportAlmacenesComponent;
