import React, { useContext, useDeferredValue, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
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
import { DeleteOutline, Inventory2, Send } from "@mui/icons-material";
import { useMutation, useQuery } from "react-query";
import sucursalesService from "../../async/services/get/sucursalesService";
import productosSimpleService from "../../async/services/get/productosSimpleService";
import proveedoresService from "../../async/services/get/proveedoresService";
import stockInicialService from "../../async/services/post/stockInicialService";
import { MainContext } from "../../context/MainContext";

const initialState = {
  id_sucursal: "",
  cantidades: {},
  seleccionados: {},
  ordenSeleccionados: [],
};

const getDetalleProducto = (producto) =>
  [producto.concentracion, producto.forma_farmaceutica]
    .filter(Boolean)
    .join(" | ");

const getFechaCaducidadPorDefecto = () => {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() + 1);
  return fecha.toISOString().slice(0, 10);
};

function StockInicialComponent() {
  const { user } = useContext(MainContext);
  const [carga, setCarga] = useState(initialState);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda);

  const { data: sucursalesData = [], isLoading: isLoadingSucursales } =
    useQuery("sucursales", sucursalesService);

  const { data: proveedoresData = [] } = useQuery(
    "proveedores",
    proveedoresService
  );

  const { data: productosData = [], isLoading: isLoadingProductos } =
    useQuery(
      ["productos-simple-stock-inicial", busquedaDiferida],
      () => productosSimpleService({ q: busquedaDiferida, limit: 300 }),
      { keepPreviousData: true, staleTime: 30000 }
    );

  const itemsSeleccionados = useMemo(
    () =>
      carga.ordenSeleccionados
        .map((id) => carga.seleccionados[id])
        .filter(Boolean),
    [carga.ordenSeleccionados, carga.seleccionados]
  );
  const idMasReciente = carga.ordenSeleccionados[0];

  const cargaMutation = useMutation(stockInicialService, {
    onSuccess: (response) => {
      setCarga((prev) => ({ ...initialState, id_sucursal: prev.id_sucursal }));
      setSnackbar({
        open: true,
        message: response?.message || "Stock inicial cargado correctamente.",
        severity: "success",
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error?.message || "No se pudo cargar el stock inicial.",
        severity: "error",
      });
    },
  });

  const handleCantidadChange = (producto, value) => {
    const cantidad = Math.max(0, Number(value) || 0);
    setCarga((prev) => {
      const yaSeleccionado = Boolean(prev.seleccionados[producto.id_producto]);
      const seleccionados =
        cantidad > 0
          ? {
              ...prev.seleccionados,
              [producto.id_producto]: {
                ...producto,
                cantidad,
                fecha_caducidad:
                  prev.seleccionados[producto.id_producto]
                    ?.fecha_caducidad ||
                  (producto.ultima_fecha_caducidad
                    ? String(producto.ultima_fecha_caducidad).slice(0, 10)
                    : getFechaCaducidadPorDefecto()),
                precio_venta:
                  prev.seleccionados[producto.id_producto]?.precio_venta ??
                  producto.ultimo_precio_venta ??
                  producto.precio ??
                  "",
                precio_unitario:
                  prev.seleccionados[producto.id_producto]
                    ?.precio_unitario ??
                  producto.ultimo_precio_compra ??
                  "",
                id_proveedor:
                  prev.seleccionados[producto.id_producto]?.id_proveedor ||
                  producto.ultimo_id_proveedor ||
                  "",
              },
            }
          : Object.fromEntries(
              Object.entries(prev.seleccionados).filter(
                ([idProducto]) => Number(idProducto) !== producto.id_producto
              )
            );

      let ordenSeleccionados = prev.ordenSeleccionados;
      if (cantidad > 0 && !yaSeleccionado) {
        ordenSeleccionados = [producto.id_producto, ...prev.ordenSeleccionados];
      } else if (cantidad <= 0) {
        ordenSeleccionados = prev.ordenSeleccionados.filter(
          (id) => Number(id) !== Number(producto.id_producto)
        );
      }

      return {
        ...prev,
        cantidades: { ...prev.cantidades, [producto.id_producto]: cantidad },
        seleccionados,
        ordenSeleccionados,
      };
    });
  };

  const handleItemFieldChange = (idProducto, field, value) => {
    setCarga((prev) => ({
      ...prev,
      seleccionados: {
        ...prev.seleccionados,
        [idProducto]: {
          ...prev.seleccionados[idProducto],
          [field]: value,
        },
      },
    }));
  };

  const handleQuitarSeleccionado = (idProducto) => {
    setCarga((prev) => ({
      ...prev,
      cantidades: { ...prev.cantidades, [idProducto]: 0 },
      seleccionados: Object.fromEntries(
        Object.entries(prev.seleccionados).filter(
          ([seleccionadoId]) => Number(seleccionadoId) !== Number(idProducto)
        )
      ),
      ordenSeleccionados: prev.ordenSeleccionados.filter(
        (id) => Number(id) !== Number(idProducto)
      ),
    }));
  };

  const handleCargar = () => {
    if (!carga.id_sucursal) {
      setSnackbar({
        open: true,
        message: "Selecciona la sucursal a la que vas a cargar el stock.",
        severity: "error",
      });
      return;
    }

    if (itemsSeleccionados.length === 0) {
      setSnackbar({
        open: true,
        message: "Indica al menos una cantidad para cargar.",
        severity: "error",
      });
      return;
    }

    cargaMutation.mutate({
      id_sucursal: Number(carga.id_sucursal),
      id_trabajador: user?.id_trabajador || null,
      items: itemsSeleccionados.map((item) => ({
        id_producto: item.id_producto,
        subCantidad: item.cantidad,
        fecha_caducidad: item.fecha_caducidad || null,
        precio_unitario:
          item.precio_unitario !== "" ? item.precio_unitario : null,
        id_proveedor: item.id_proveedor || null,
        precio_venta: item.precio_venta !== "" ? item.precio_venta : null,
      })),
    });
  };

  return (
    <>
      <Card>
        <CardHeader
          avatar={<Inventory2 color="primary" />}
          title="Carga de stock inicial"
          subheader="Selecciona la sucursal y escribe las unidades sueltas iniciales de cada producto"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Sucursal"
              value={carga.id_sucursal}
              disabled={isLoadingSucursales}
              onChange={(event) =>
                setCarga((prev) => ({
                  ...prev,
                  id_sucursal: event.target.value,
                }))
              }
              size="small"
              sx={{ maxWidth: 320 }}
            >
              {sucursalesData.map((sucursal) => (
                <MenuItem key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                  {sucursal.nombre}
                  {sucursal.es_principal ? " (Principal)" : ""}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 380px" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Seleccionados
                  {itemsSeleccionados.length > 0
                    ? ` (${itemsSeleccionados.length})`
                    : ""}
                </Typography>
                {itemsSeleccionados.length === 0 ? (
                  <Alert severity="info">
                    Los productos que marques con una cantidad a la derecha
                    aparecerán aquí.
                  </Alert>
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      El último producto agregado se ve en naranja hasta que
                      revises sus datos. La caducidad, el precio de compra,
                      el precio de venta y el proveedor son opcionales (se
                      sugieren con los
                      últimos datos conocidos del producto). El precio de
                      venta se comparte con todas las sucursales.
                    </Typography>
                    <Stack
                      spacing={1.5}
                      sx={{ maxHeight: 620, overflowY: "auto", pr: 0.5 }}
                    >
                      {itemsSeleccionados.map((item) => {
                        const esNuevo =
                          Number(item.id_producto) === Number(idMasReciente);
                        return (
                        <Box
                          key={item.id_producto}
                          sx={{
                            backgroundColor: esNuevo ? "#fff3e0" : "#e8f5e9",
                            border: esNuevo
                              ? "1px solid #ffb74d"
                              : "1px solid #a5d6a7",
                            borderLeft: esNuevo
                              ? "4px solid #e65100"
                              : "4px solid #2e7d32",
                            borderRadius: 1,
                            p: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box>
                              {esNuevo && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#e65100",
                                    display: "block",
                                  }}
                                >
                                  RECIÉN AGREGADO — revisa sus datos
                                </Typography>
                              )}
                              <Typography variant="body2" fontWeight={700}>
                                {item.nombre}
                              </Typography>
                              {getDetalleProducto(item) && (
                                <Typography
                                  variant="caption"
                                  color={
                                    esNuevo ? "warning.dark" : "success.dark"
                                  }
                                >
                                  {getDetalleProducto(item)}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: 700 }}
                              >
                                Cantidad: {item.cantidad}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleQuitarSeleccionado(item.id_producto)
                              }
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: 0.75,
                            }}
                          >
                            <TextField
                              label="Caducidad"
                              type="date"
                              size="small"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              value={item.fecha_caducidad || ""}
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.id_producto,
                                  "fecha_caducidad",
                                  event.target.value
                                )
                              }
                            />
                            <TextField
                              label="Compra"
                              type="number"
                              size="small"
                              fullWidth
                              value={
                                item.precio_unitario ??
                                item.ultimo_precio_compra ??
                                ""
                              }
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.id_producto,
                                  "precio_unitario",
                                  event.target.value
                                )
                              }
                              placeholder="0.00"
                              inputProps={{ min: 0, step: "0.01" }}
                            />
                            <TextField
                              label="Venta"
                              type="number"
                              size="small"
                              fullWidth
                              value={
                                item.precio_venta ??
                                item.ultimo_precio_venta ??
                                item.precio ??
                                ""
                              }
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.id_producto,
                                  "precio_venta",
                                  event.target.value
                                )
                              }
                              placeholder="0.00"
                              inputProps={{ min: 0, step: "0.01" }}
                            />
                            <TextField
                              select
                              label="Proveedor"
                              size="small"
                              fullWidth
                              value={
                                item.id_proveedor ||
                                item.ultimo_id_proveedor ||
                                ""
                              }
                              onChange={(event) =>
                                handleItemFieldChange(
                                  item.id_producto,
                                  "id_proveedor",
                                  event.target.value
                                )
                              }
                            >
                              <MenuItem value="">
                                <em>Sin proveedor</em>
                              </MenuItem>
                              {proveedoresData
                                .filter((proveedor) => proveedor.activo !== false)
                                .map((proveedor) => (
                                <MenuItem
                                  key={proveedor.id_proveedor}
                                  value={proveedor.id_proveedor}
                                >
                                  {proveedor.nombre}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </Box>
                        );
                      })}
                    </Stack>
                  </>
                )}
              </Box>

              <Box>
                <TextField
                  label="Buscar producto"
                  size="small"
                  fullWidth
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Nombre o codigo de barra"
                  sx={{ mb: 1.5 }}
                />
                {isLoadingProductos ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : productosData.length === 0 ? (
                  <Alert severity="warning">No se encontraron productos.</Alert>
                ) : (
                  <TableContainer sx={{ maxHeight: 640 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell sx={{ width: 150 }}>Cantidad</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productosData.map((producto) => (
                          <TableRow
                            key={producto.id_producto}
                            hover
                            selected={Boolean(
                              carga.cantidades[producto.id_producto]
                            )}
                            sx={{
                              "&.Mui-selected": { backgroundColor: "#e8f5e9" },
                              "&.Mui-selected:hover": {
                                backgroundColor: "#d7efd9",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {producto.nombre}
                              </Typography>
                              {getDetalleProducto(producto) && (
                                <Typography
                                  variant="caption"
                                  color="text.primary"
                                >
                                  {getDetalleProducto(producto)}
                                </Typography>
                              )}
                              {getDetalleProducto(producto) && <br />}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Codigo: {producto.codigo_barra || "Sin codigo"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={
                                  carga.cantidades[producto.id_producto] || ""
                                }
                                onChange={(event) =>
                                  handleCantidadChange(
                                    producto,
                                    event.target.value
                                  )
                                }
                                inputProps={{ min: 0, step: 1 }}
                                placeholder="0"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>

            <Alert severity={itemsSeleccionados.length ? "success" : "info"}>
              {itemsSeleccionados.length
                ? `${itemsSeleccionados.length} producto(s), ${itemsSeleccionados.reduce(
                    (total, item) => total + item.cantidad,
                    0
                  )} unidad(es) para cargar.`
                : "Escribe la cantidad inicial de cada producto que quieras cargar."}
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleCargar}
              disabled={
                cargaMutation.isLoading ||
                !carga.id_sucursal ||
                itemsSeleccionados.length === 0
              }
            >
              {cargaMutation.isLoading ? "Procesando..." : "Cargar stock inicial"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default StockInicialComponent;
