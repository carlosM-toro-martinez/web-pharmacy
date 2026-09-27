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
import { DeleteOutline, LocalShipping, Send } from "@mui/icons-material";
import { useMutation, useQuery } from "react-query";
import sucursalesService from "../../async/services/get/sucursalesService";
import inventarioService from "../../async/services/get/inventarioService";
import proveedoresService from "../../async/services/get/proveedoresService";
import sucursalTransferirService from "../../async/services/post/sucursalTransferirService";
import { MainContext } from "../../context/MainContext";

const initialState = {
  id_sucursal_origen: "",
  id_sucursal_destino: "",
  cantidades: {},
  seleccionados: {},
  ordenSeleccionados: [],
};

const getDetalleProducto = (producto) =>
  [producto.concentracion, producto.forma_farmaceutica]
    .filter(Boolean)
    .join(" | ");

function TransferenciasInventarioComponent() {
  const { user } = useContext(MainContext);
  const [transferencia, setTransferencia] = useState(initialState);
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
  const { data: inventarioOrigen = [], isLoading: isLoadingInventario } =
    useQuery(
      [
        "inventario-sucursal-transferencia",
        transferencia.id_sucursal_origen,
        busquedaDiferida,
      ],
      () =>
        inventarioService(transferencia.id_sucursal_origen, {
          transferencia: true,
          q: busquedaDiferida,
          limit: 120,
        }),
      {
        enabled: Boolean(transferencia.id_sucursal_origen),
        keepPreviousData: true,
        staleTime: 30000,
      }
    );

  const inventariosTransferibles = useMemo(
    () => inventarioOrigen.filter((producto) => Number(producto.subCantidad) > 0),
    [inventarioOrigen]
  );

  const itemsSeleccionados = useMemo(
    () =>
      transferencia.ordenSeleccionados
        .map((id) => transferencia.seleccionados[id])
        .filter(Boolean),
    [transferencia.ordenSeleccionados, transferencia.seleccionados]
  );
  const idMasReciente = transferencia.ordenSeleccionados[0];

  const transferirMutation = useMutation(sucursalTransferirService, {
    onSuccess: (response) => {
      setTransferencia((prev) => ({
        ...initialState,
        id_sucursal_origen: prev.id_sucursal_origen,
        id_sucursal_destino: prev.id_sucursal_destino,
      }));
      setSnackbar({
        open: true,
        message: response?.message || "Transferencia realizada correctamente.",
        severity: "success",
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: error?.message || "No se pudo realizar la transferencia.",
        severity: "error",
      });
    },
  });

  const handleCantidadChange = (producto, value, stock) => {
    const cantidad = Math.max(0, Math.min(Number(value) || 0, Number(stock)));
    setTransferencia((prev) => {
      const yaSeleccionado = Boolean(
        prev.seleccionados[producto.id_producto]
      );
      const seleccionados =
        cantidad > 0
          ? {
              ...prev.seleccionados,
              [producto.id_producto]: {
                ...producto,
                transferencia: cantidad,
                fecha_caducidad:
                  prev.seleccionados[producto.id_producto]
                    ?.fecha_caducidad ||
                  (producto.ultima_fecha_caducidad
                    ? String(producto.ultima_fecha_caducidad).slice(0, 10)
                    : ""),
                precio_venta:
                  prev.seleccionados[producto.id_producto]?.precio_venta ??
                  producto.ultimo_precio_venta ??
                  "",
                precio_compra:
                  prev.seleccionados[producto.id_producto]?.precio_compra ??
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
    setTransferencia((prev) => ({
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
    setTransferencia((prev) => ({
      ...prev,
      cantidades: {
        ...prev.cantidades,
        [idProducto]: 0,
      },
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

  const handleTransferir = () => {
    if (!transferencia.id_sucursal_origen || !transferencia.id_sucursal_destino) {
      setSnackbar({
        open: true,
        message: "Selecciona la sucursal de origen y destino.",
        severity: "error",
      });
      return;
    }

    if (itemsSeleccionados.length === 0) {
      setSnackbar({
        open: true,
        message: "Indica al menos una unidad para transferir.",
        severity: "error",
      });
      return;
    }

    transferirMutation.mutate({
      id_sucursal_origen: Number(transferencia.id_sucursal_origen),
      id_sucursal_destino: Number(transferencia.id_sucursal_destino),
      id_trabajador: user?.id_trabajador || null,
      items: itemsSeleccionados.map((item) => ({
        id_producto: item.id_producto,
        subCantidad: item.transferencia,
        fecha_caducidad: item.fecha_caducidad || null,
        precioVenta: item.precio_venta !== "" ? item.precio_venta : null,
        precio_unitario: item.precio_compra !== "" ? item.precio_compra : null,
        id_proveedor: item.id_proveedor || null,
      })),
    });
  };

  const destinoInvalido =
    transferencia.id_sucursal_destino &&
    transferencia.id_sucursal_destino === transferencia.id_sucursal_origen;

  return (
    <>
      <Card>
        <CardHeader
          avatar={<LocalShipping color="primary" />}
          title="Transferencia de unidades"
          subheader="Selecciona varias líneas y muévelas en una sola operación"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                maxWidth: 700,
              }}
            >
              <TextField
                select
                label="Sucursal origen"
                value={transferencia.id_sucursal_origen}
                disabled={isLoadingSucursales}
                onChange={(event) =>
                  setTransferencia({
                    ...initialState,
                    id_sucursal_origen: event.target.value,
                  })
                }
                size="small"
              >
                {sucursalesData.map((sucursal) => (
                  <MenuItem key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                    {sucursal.nombre}
                    {sucursal.es_principal ? " (Principal)" : ""}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Sucursal destino"
                value={transferencia.id_sucursal_destino}
                disabled={!transferencia.id_sucursal_origen || isLoadingSucursales}
                onChange={(event) =>
                  setTransferencia((prev) => ({
                    ...prev,
                    id_sucursal_destino: event.target.value,
                  }))
                }
                error={Boolean(destinoInvalido)}
                helperText={destinoInvalido ? "Debe ser diferente al origen" : ""}
                size="small"
              >
                {sucursalesData
                  .filter(
                    (sucursal) =>
                      sucursal.id_sucursal !==
                      Number(transferencia.id_sucursal_origen)
                  )
                  .map((sucursal) => (
                    <MenuItem key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                      {sucursal.nombre}
                    </MenuItem>
                ))}
              </TextField>
            </Box>

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
                    Selecciona una sucursal origen y marca las unidades a
                    enviar en la lista de la derecha.
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
                      el precio de venta y el proveedor se sugieren con los
                      últimos datos conocidos en la sucursal de origen. El
                      precio de venta se comparte con todas las sucursales.
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
                                  Disponibles: {item.subCantidad} — A enviar:{" "}
                                  {item.transferencia}
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
                                  item.precio_compra ??
                                  item.ultimo_precio_compra ??
                                  ""
                                }
                                onChange={(event) =>
                                  handleItemFieldChange(
                                    item.id_producto,
                                    "precio_compra",
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
                  disabled={!transferencia.id_sucursal_origen}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Nombre o codigo de barra"
                  sx={{ mb: 1.5 }}
                />
                {!transferencia.id_sucursal_origen ? (
                  <Alert severity="info">
                    Selecciona una sucursal origen para ver sus unidades
                    disponibles.
                  </Alert>
                ) : isLoadingInventario ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : inventariosTransferibles.length === 0 ? (
                  <Alert severity="warning">
                    No hay unidades sueltas disponibles en esta sucursal.
                  </Alert>
                ) : (
                  <TableContainer sx={{ maxHeight: 640 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="right">Disp.</TableCell>
                          <TableCell sx={{ width: 130 }}>A enviar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inventariosTransferibles.map((inventario) => (
                          <TableRow
                            key={inventario.id_producto}
                            hover
                            selected={Boolean(
                              transferencia.cantidades[inventario.id_producto]
                            )}
                            sx={{
                              "&.Mui-selected": {
                                backgroundColor: "#e8f5e9",
                              },
                              "&.Mui-selected:hover": {
                                backgroundColor: "#d7efd9",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {inventario.nombre}
                              </Typography>
                              {getDetalleProducto(inventario) && (
                                <Typography
                                  variant="caption"
                                  color="text.primary"
                                >
                                  {getDetalleProducto(inventario)}
                                </Typography>
                              )}
                              {getDetalleProducto(inventario) && <br />}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Codigo: {inventario.codigo_barra || "Sin codigo"}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {inventario.subCantidad}
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                fullWidth
                                value={
                                  transferencia.cantidades[
                                    inventario.id_producto
                                  ] || ""
                                }
                                onChange={(event) =>
                                  handleCantidadChange(
                                    inventario,
                                    event.target.value,
                                    inventario.subCantidad
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  max: inventario.subCantidad,
                                  step: 1,
                                }}
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
                    (total, item) => total + item.transferencia,
                    0
                  )} unidad(es) seleccionada(s).`
                : "Escribe las unidades que deseas enviar en una o varias filas."}
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleTransferir}
              disabled={
                transferirMutation.isLoading ||
                !transferencia.id_sucursal_origen ||
                !transferencia.id_sucursal_destino ||
                Boolean(destinoInvalido) ||
                itemsSeleccionados.length === 0
              }
            >
              {transferirMutation.isLoading ? "Procesando..." : "Transferir unidades"}
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

export default TransferenciasInventarioComponent;
