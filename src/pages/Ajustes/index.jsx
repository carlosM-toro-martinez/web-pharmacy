import React, { useContext, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
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
import SyncIcon from "@mui/icons-material/Sync";
import RefreshIcon from "@mui/icons-material/Refresh";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DrawerComponent from "../../components/DrawerComponent";
import { useMutation, useQuery } from "react-query";
import ajustesResumenService from "../../async/services/get/ajustesResumenService";
import ajustesMantenimientoService from "../../async/services/get/ajustesMantenimientoService";
import ajustesStockService from "../../async/services/get/ajustesStockService";
import ajustesDescuadreStockService from "../../async/services/get/ajustesDescuadreStockService";
import ajustesLotesSobrevendidosService from "../../async/services/get/ajustesLotesSobrevendidosService";
import ajustesSincronizarProductoService from "../../async/services/post/ajustesSincronizarProductoService";
import ajustesSincronizarStockService from "../../async/services/post/ajustesSincronizarStockService";
import ajustesRegistrosVaciosService from "../../async/services/get/ajustesRegistrosVaciosService";
import ajustesVentasDuplicadasService from "../../async/services/get/ajustesVentasDuplicadasService";
import generarExcelVentasDuplicadas from "./generarExcelVentasDuplicadas";
import DownloadIcon from "@mui/icons-material/Download";
import sucursalesService from "../../async/services/get/sucursalesService";
import sucursalAddService from "../../async/services/post/sucursalAddService";
import sucursalTransferirService from "../../async/services/post/sucursalTransferirService";
import sucursalUpdateService from "../../async/services/put/sucursalUpdateService";
import sucursalPrincipalService from "../../async/services/post/sucursalPrincipalService";
import sucursalDeleteService from "../../async/services/delete/sucursalDeleteService";
import inventarioService from "../../async/services/get/inventarioService";
import { MainContext } from "../../context/MainContext";

const formatNumber = (value) => Number(value || 0).toFixed(2);

function Ajustes() {
  const { user } = useContext(MainContext);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [nuevaSucursal, setNuevaSucursal] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    dominio: "",
  });
  const [transferencia, setTransferencia] = useState({
    id_sucursal_origen: "",
    id_sucursal_destino: "",
    id_inventario: "",
    cantidad: "",
    subCantidad: "",
    peso: "",
  });
  const [sucursalesEditadas, setSucursalesEditadas] = useState({});

  const { data, isLoading, error, refetch } = useQuery(
    "ajustes-resumen",
    ajustesResumenService
  );
  const {
    data: mantenimientoData,
    isLoading: isLoadingMantenimiento,
    refetch: refetchMantenimiento,
  } = useQuery("ajustes-mantenimiento", ajustesMantenimientoService);
  const { data: sucursales = [], refetch: refetchSucursales } = useQuery(
    "sucursales",
    sucursalesService
  );
  const {
    data: stockComparacion,
    isLoading: isLoadingStockComparacion,
    isFetched: isFetchedStockComparacion,
    refetch: refetchStockComparacion,
  } = useQuery("ajustes-stock-comparacion", ajustesStockService, {
    enabled: false,
  });
  const {
    data: descuadreStock,
    isLoading: isLoadingDescuadreStock,
    isFetched: isFetchedDescuadreStock,
    refetch: refetchDescuadreStock,
  } = useQuery("ajustes-descuadre-stock", ajustesDescuadreStockService, {
    enabled: false,
  });
  const {
    data: lotesSobrevendidos,
    isLoading: isLoadingLotesSobrevendidos,
    isFetched: isFetchedLotesSobrevendidos,
    refetch: refetchLotesSobrevendidos,
  } = useQuery(
    "ajustes-lotes-sobrevendidos",
    ajustesLotesSobrevendidosService,
    { enabled: false }
  );
  const {
    data: registrosVacios,
    isLoading: isLoadingRegistrosVacios,
    isFetched: isFetchedRegistrosVacios,
    refetch: refetchRegistrosVacios,
  } = useQuery("ajustes-registros-vacios", ajustesRegistrosVaciosService, {
    enabled: false,
  });
  const {
    data: ventasDuplicadas,
    isLoading: isLoadingVentasDuplicadas,
    refetch: refetchVentasDuplicadas,
  } = useQuery("ajustes-ventas-duplicadas", ajustesVentasDuplicadasService);
  const [descargandoExcelDuplicadas, setDescargandoExcelDuplicadas] = useState(false);
  const handleDescargarExcelDuplicadas = async () => {
    if (!ventasDuplicadas?.productos?.length) return;
    setDescargandoExcelDuplicadas(true);
    try {
      await generarExcelVentasDuplicadas(ventasDuplicadas);
    } finally {
      setDescargandoExcelDuplicadas(false);
    }
  };
  const {
    data: inventarioOrigen = [],
    isLoading: loadingInventarioOrigen,
    refetch: refetchInventarioOrigen,
  } = useQuery(
    ["inventario-sucursal", transferencia.id_sucursal_origen],
    () => inventarioService(transferencia.id_sucursal_origen),
    {
      enabled: Boolean(transferencia.id_sucursal_origen),
    }
  );

  const sincronizarProductoMutation = useMutation(
    ajustesSincronizarProductoService,
    {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "Producto sincronizado correctamente.",
          severity: "success",
        });
        refetch();
        refetchMantenimiento();
        if (isFetchedStockComparacion) refetchStockComparacion();
      },
      onError: (err) => {
        setSnackbar({
          open: true,
          message: `No se pudo sincronizar el producto: ${
            err?.message || err || "Intente nuevamente."
          }`,
          severity: "error",
        });
      },
    }
  );

  const sincronizarTodoMutation = useMutation(ajustesSincronizarStockService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Stocks sincronizados correctamente.",
        severity: "success",
      });
      refetchStockComparacion();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: `No se pudieron sincronizar los stocks: ${
          err?.message || err || "Intente nuevamente."
        }`,
        severity: "error",
      });
    },
  });

  const crearSucursalMutation = useMutation(sucursalAddService, {
    onSuccess: () => {
      setNuevaSucursal({ nombre: "", direccion: "", telefono: "", dominio: "" });
      setSnackbar({
        open: true,
        message: "Sucursal creada correctamente.",
        severity: "success",
      });
      refetchSucursales();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: `No se pudo crear la sucursal: ${
          err?.message || err || "Revise los datos."
        }`,
        severity: "error",
      });
    },
  });

  const transferirMutation = useMutation(sucursalTransferirService, {
    onSuccess: () => {
      setTransferencia((prev) => ({
        ...prev,
        id_inventario: "",
        cantidad: "",
        subCantidad: "",
        peso: "",
      }));
      setSnackbar({
        open: true,
        message: "Transferencia realizada correctamente.",
        severity: "success",
      });
      refetch();
      refetchInventarioOrigen();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: `No se pudo transferir: ${
          err?.message || err || "Revise el stock disponible."
        }`,
        severity: "error",
      });
    },
  });

  const actualizarSucursalMutation = useMutation(sucursalUpdateService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Sucursal actualizada correctamente.",
        severity: "success",
      });
      refetchSucursales();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: `No se pudo actualizar la sucursal: ${
          err?.message || err || "Revise los datos."
        }`,
        severity: "error",
      });
    },
  });

  const marcarPrincipalMutation = useMutation(sucursalPrincipalService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Sucursal principal actualizada.",
        severity: "success",
      });
      refetchSucursales();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: `No se pudo marcar como principal: ${
          err?.message || err || "Intente nuevamente."
        }`,
        severity: "error",
      });
    },
  });

  const eliminarSucursalMutation = useMutation(sucursalDeleteService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Sucursal eliminada.",
        severity: "success",
      });
      refetchSucursales();
    },
    onError: (err) => {
      setSnackbar({
        open: true,
        message: err?.message || "No se pudo eliminar la sucursal.",
        severity: "error",
      });
    },
  });

  const handleEliminarSucursal = (sucursal) => {
    if (
      window.confirm(
        `¿Eliminar la sucursal "${sucursal.nombre}"? Esto no se puede deshacer.`
      )
    ) {
      eliminarSucursalMutation.mutate(sucursal.id_sucursal);
    }
  };

  const diferencias = stockComparacion?.diferencias || [];
  const descuadresPorSucursal = descuadreStock?.diferencias || [];
  const productosDuplicadosList = ventasDuplicadas?.productos || [];
  const lotesSobrevendidosList = lotesSobrevendidos?.lotes || [];
  const inventariosVaciosList = registrosVacios?.inventariosVacios || [];
  const lotesVaciosBorrablesList = registrosVacios?.lotesVaciosBorrables || [];
  const inventariosHuerfanos = data?.huerfanos?.huerfanos || [];
  const inventariosNegativos = data?.negativos?.inventarios || [];
  const comprasDuplicadas = data?.comprasDuplicadas?.duplicadas || [];
  const movimientosDuplicados = data?.movimientosDuplicados?.duplicados || [];
  const proveedoresDivergentes = data?.proveedoresDivergentes?.productos || [];
  const mantenimiento = mantenimientoData || data?.mantenimiento || {};
  const totalRegistrosVacios =
    (mantenimiento.inventariosVacios || 0) +
    (mantenimiento.lotesVaciosBorrables || 0);
  const totalInventariosConAlerta =
    (data?.huerfanos?.totalHuerfanos || 0) +
    (data?.negativos?.totalNegativos || 0);
  const inventariosTransferibles = useMemo(() => {
    return inventarioOrigen.flatMap((producto) =>
      (producto.inventarios || [])
        .filter(
          (inventario) =>
            Number(inventario.cantidad || 0) > 0 ||
            Number(inventario.subCantidad || 0) > 0 ||
            Number(inventario.peso || 0) > 0
        )
        .map((inventario) => ({
          ...inventario,
          id_producto: producto.id_producto,
          producto: producto.nombre,
          codigo_barra: producto.codigo_barra,
        }))
    );
  }, [inventarioOrigen]);
  const inventarioSeleccionado = inventariosTransferibles.find(
    (inventario) =>
      String(inventario.id_inventario) === String(transferencia.id_inventario)
  );
  const loadingAction =
    sincronizarProductoMutation.isLoading ||
    sincronizarTodoMutation.isLoading ||
    crearSucursalMutation.isLoading ||
    transferirMutation.isLoading ||
    actualizarSucursalMutation.isLoading ||
    marcarPrincipalMutation.isLoading ||
    eliminarSucursalMutation.isLoading ||
    isLoadingMantenimiento;

  const handleCrearSucursal = () => {
    crearSucursalMutation.mutate(nuevaSucursal);
  };

  const getSucursalEditada = (sucursal) =>
    sucursalesEditadas[sucursal.id_sucursal] || {
      nombre: sucursal.nombre || "",
      direccion: sucursal.direccion || "",
      telefono: sucursal.telefono || "",
      dominio: sucursal.dominio || "",
      activo: sucursal.activo !== false,
    };

  const handleSucursalEditChange = (sucursal, field, value) => {
    const actual = getSucursalEditada(sucursal);
    setSucursalesEditadas((prev) => ({
      ...prev,
      [sucursal.id_sucursal]: {
        ...actual,
        [field]: value,
      },
    }));
  };

  const handleGuardarSucursal = (sucursal) => {
    actualizarSucursalMutation.mutate({
      id_sucursal: sucursal.id_sucursal,
      payload: getSucursalEditada(sucursal),
    });
  };

  const handleTransferir = () => {
    if (!inventarioSeleccionado) return;

    transferirMutation.mutate({
      id_producto: inventarioSeleccionado.id_producto,
      id_lote: inventarioSeleccionado.id_lote,
      id_sucursal_origen: transferencia.id_sucursal_origen,
      id_sucursal_destino: transferencia.id_sucursal_destino,
      cantidad: Number(transferencia.cantidad || 0),
      subCantidad: Number(transferencia.subCantidad || 0),
      peso: Number(transferencia.peso || 0),
      id_trabajador: user?.id_trabajador || null,
    });
  };

  return (
    <DrawerComponent>
      <Box sx={{ p: 2 }}>
        <Typography
          component="h1"
          sx={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Ajustes y auditoria
        </Typography>

        <Paper sx={{ p: 2, mb: 3, border: "2px solid #FF4500" }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Stock a revisar fisicamente (ventas duplicadas)
              </Typography>
              <Typography color="text.secondary">
                Productos donde se confirmo que una venta quedo registrada
                dos veces en el sistema (mismo producto/lote repetido en una
                sola venta), descontando el inventario el doble de lo
                vendido. El cliente pago correctamente una sola vez; esto
                solo afecta el stock, no el dinero. Esta lista es exacta
                (no una estimacion): hay que contar fisicamente estos
                productos y ajustar el stock en el sistema si corresponde.
              </Typography>
              {ventasDuplicadas && (
                <Typography sx={{ mt: 1 }}>
                  <strong style={{ color: "#d32f2f" }}>
                    {ventasDuplicadas.totalProductosAfectados}
                  </strong>{" "}
                  producto(s)/sucursal afectado(s),{" "}
                  <strong style={{ color: "#d32f2f" }}>
                    {ventasDuplicadas.totalUnidadesDescontadasDeMas}
                  </strong>{" "}
                  unidad(es) descontada(s) de mas en total
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={
                  isLoadingVentasDuplicadas ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshIcon />
                  )
                }
                onClick={() => refetchVentasDuplicadas()}
                disabled={isLoadingVentasDuplicadas}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#FF4500", "&:hover": { backgroundColor: "#CC3700" } }}
                startIcon={
                  descargandoExcelDuplicadas ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={handleDescargarExcelDuplicadas}
                disabled={descargandoExcelDuplicadas || !productosDuplicadosList.length}
              >
                Descargar Excel
              </Button>
            </Stack>
          </Box>
        </Paper>

        {isLoadingVentasDuplicadas ? (
          <Paper sx={{ p: 3, textAlign: "center", mb: 3 }}>
            <CircularProgress />
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#fff3e0" }}>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Codigo</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell align="right">Stock actual</TableCell>
                  <TableCell align="right">Descontado de mas</TableCell>
                  <TableCell align="right">Stock sugerido</TableCell>
                  <TableCell>Ultima venta duplicada</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosDuplicadosList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay productos con ventas duplicadas detectadas.
                    </TableCell>
                  </TableRow>
                ) : (
                  productosDuplicadosList.map((p) => (
                    <TableRow key={`${p.id_producto}-${p.id_sucursal}`} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>{p.nombre}</TableCell>
                      <TableCell>{p.codigo_barra || "N/A"}</TableCell>
                      <TableCell>{p.sucursal}</TableCell>
                      <TableCell align="right">{p.stockReal}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "#d32f2f" }}
                      >
                        +{p.unidadesDescontadasDeMas}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {p.stockSugerido}
                      </TableCell>
                      <TableCell>
                        {p.fechaMasReciente
                          ? new Date(p.fechaMasReciente).toLocaleDateString("es-BO")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {isLoading ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Revisando inventario...</Typography>
          </Paper>
        ) : error ? (
          <Alert severity="error">
            No se pudo cargar la auditoria de inventario.
          </Alert>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                mb: 3,
              }}
            >
              <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary">
                  Inventarios con alerta
                </Typography>
                <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {totalInventariosConAlerta}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary">
                  Registros vacios borrables
                </Typography>
                <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {totalRegistrosVacios}
                </Typography>
              </Paper>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    Registros vacios (revision manual)
                  </Typography>
                  <Typography color="text.secondary">
                    Lista inventarios en cero y lotes vacios sin ventas
                    asociadas. Ya no se eliminan automaticamente: si un
                    registro tiene un movimiento de inventario asociado (ej.
                    &quot;Salida sin venta&quot;), borrarlo destruye la unica
                    evidencia de ese movimiento y puede producir descuadres
                    invisibles.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {mantenimiento.inventariosVacios || 0} inventario(s) vacio(s)
                    {" | "}
                    {mantenimiento.lotesVaciosBorrables || 0} lote(s) borrable(s)
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={
                    isLoadingRegistrosVacios ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CleaningServicesIcon />
                    )
                  }
                  onClick={() => refetchRegistrosVacios()}
                  disabled={loadingAction || totalRegistrosVacios === 0}
                >
                  {isFetchedRegistrosVacios ? "Revisar de nuevo" : "Ver candidatos"}
                </Button>
              </Box>
            </Paper>

            {isFetchedRegistrosVacios && (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell>Tiene movimiento asociado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventariosVaciosList.length === 0 &&
                    lotesVaciosBorrablesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay registros vacios pendientes de revision.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {inventariosVaciosList.map((row) => (
                          <TableRow key={`inv-${row.id_inventario}`} hover>
                            <TableCell>Inventario</TableCell>
                            <TableCell>{row.producto}</TableCell>
                            <TableCell>
                              {row.numero_lote || row.id_lote || "N/A"}
                            </TableCell>
                            <TableCell>{row.sucursal || "N/A"}</TableCell>
                            <TableCell>
                              {row.tieneMovimientoAsociado ? (
                                <strong style={{ color: "#d32f2f" }}>
                                  Si - no borrar sin revisar
                                </strong>
                              ) : (
                                "No"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {lotesVaciosBorrablesList.map((row) => (
                          <TableRow key={`lote-${row.id_lote}`} hover>
                            <TableCell>Lote</TableCell>
                            <TableCell>{row.producto}</TableCell>
                            <TableCell>
                              {row.numero_lote || row.id_lote}
                            </TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>
                              {row.tieneMovimientoAsociado ? (
                                <strong style={{ color: "#d32f2f" }}>
                                  Si - no borrar sin revisar
                                </strong>
                              ) : (
                                "No"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Sucursales
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                El inventario existente queda en Sucursal principal. Desde aqui
                puedes crear sucursales y mover stock por lote.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                    Nueva sucursal
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <TextField
                      label="Nombre"
                      size="small"
                      value={nuevaSucursal.nombre}
                      onChange={(e) =>
                        setNuevaSucursal((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Direccion"
                      size="small"
                      value={nuevaSucursal.direccion}
                      onChange={(e) =>
                        setNuevaSucursal((prev) => ({
                          ...prev,
                          direccion: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Telefono"
                      size="small"
                      value={nuevaSucursal.telefono}
                      onChange={(e) =>
                        setNuevaSucursal((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Dominio"
                      size="small"
                      placeholder="norte.midominio.com"
                      value={nuevaSucursal.dominio}
                      onChange={(e) =>
                        setNuevaSucursal((prev) => ({
                          ...prev,
                          dominio: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="contained"
                      onClick={handleCrearSucursal}
                      disabled={loadingAction || !nuevaSucursal.nombre.trim()}
                    >
                      Crear sucursal
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                    Transferir stock
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    <TextField
                      select
                      label="Sucursal origen"
                      size="small"
                      value={transferencia.id_sucursal_origen}
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          id_sucursal_origen: e.target.value,
                          id_inventario: "",
                        }))
                      }
                    >
                      {sucursales.map((sucursal) => (
                        <MenuItem
                          key={sucursal.id_sucursal}
                          value={sucursal.id_sucursal}
                        >
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Sucursal destino"
                      size="small"
                      value={transferencia.id_sucursal_destino}
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          id_sucursal_destino: e.target.value,
                        }))
                      }
                    >
                      {sucursales.map((sucursal) => (
                        <MenuItem
                          key={sucursal.id_sucursal}
                          value={sucursal.id_sucursal}
                        >
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Producto / lote"
                      size="small"
                      value={transferencia.id_inventario}
                      disabled={
                        !transferencia.id_sucursal_origen ||
                        loadingInventarioOrigen
                      }
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          id_inventario: e.target.value,
                        }))
                      }
                      sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
                    >
                      {inventariosTransferibles.map((inventario) => (
                        <MenuItem
                          key={inventario.id_inventario}
                          value={inventario.id_inventario}
                        >
                          {inventario.producto} - lote{" "}
                          {inventario.lote?.numero_lote || inventario.id_lote}
                          {" | "}
                          {inventario.subCantidad || 0} u. /{" "}
                          {inventario.cantidad || 0} cajas
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Cajas"
                      type="number"
                      size="small"
                      value={transferencia.cantidad}
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          cantidad: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Unidades"
                      type="number"
                      size="small"
                      value={transferencia.subCantidad}
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          subCantidad: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Peso"
                      type="number"
                      size="small"
                      value={transferencia.peso}
                      onChange={(e) =>
                        setTransferencia((prev) => ({
                          ...prev,
                          peso: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleTransferir}
                      disabled={
                        loadingAction ||
                        !transferencia.id_sucursal_origen ||
                        !transferencia.id_sucursal_destino ||
                        transferencia.id_sucursal_origen ===
                          transferencia.id_sucursal_destino ||
                        !inventarioSeleccionado ||
                        (!Number(transferencia.cantidad || 0) &&
                          !Number(transferencia.subCantidad || 0) &&
                          !Number(transferencia.peso || 0))
                      }
                    >
                      Transferir
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                Sucursales registradas
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {sucursales.map((sucursal) => (
                  <Paper
                    key={sucursal.id_sucursal}
                    variant="outlined"
                    sx={{ p: 1.5, minWidth: 260, flex: "1 1 260px" }}
                  >
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <TextField
                        label="Nombre"
                        size="small"
                        value={getSucursalEditada(sucursal).nombre}
                        onChange={(e) =>
                          handleSucursalEditChange(
                            sucursal,
                            "nombre",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Dominio"
                        size="small"
                        placeholder="norte.midominio.com"
                        value={getSucursalEditada(sucursal).dominio}
                        onChange={(e) =>
                          handleSucursalEditChange(
                            sucursal,
                            "dominio",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Direccion"
                        size="small"
                        value={getSucursalEditada(sucursal).direccion}
                        onChange={(e) =>
                          handleSucursalEditChange(
                            sucursal,
                            "direccion",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Telefono"
                        size="small"
                        value={getSucursalEditada(sucursal).telefono}
                        onChange={(e) =>
                          handleSucursalEditChange(
                            sucursal,
                            "telefono",
                            e.target.value
                          )
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {sucursal.es_principal ? "Principal" : "Sucursal"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleGuardarSucursal(sucursal)}
                        disabled={loadingAction}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={loadingAction || sucursal.es_principal}
                        onClick={() =>
                          marcarPrincipalMutation.mutate(sucursal.id_sucursal)
                        }
                      >
                        Hacer principal
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={loadingAction}
                        onClick={() => handleEliminarSucursal(sucursal)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    Comparacion Producto vs Inventario
                  </Typography>
                  <Typography color="text.secondary">
                    Producto se corrige usando la suma real de Inventario.
                    Como Stock Inicial y Transferencias ahora también
                    mantienen esto sincronizado, ya no se calcula solo al
                    entrar aquí — pídelo cuando quieras verificarlo.
                  </Typography>
                  {isFetchedStockComparacion && (
                    <Typography sx={{ mt: 1 }}>
                      {stockComparacion?.totalProductos || 0} producto(s)
                      revisado(s),{" "}
                      <strong
                        style={{
                          color:
                            (stockComparacion?.totalDiferencias || 0) > 0
                              ? "#d32f2f"
                              : "#2e7d32",
                        }}
                      >
                        {stockComparacion?.totalDiferencias || 0} diferencia(s)
                      </strong>
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={
                      isLoadingStockComparacion ? (
                        <CircularProgress size={16} />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                    onClick={() => refetchStockComparacion()}
                    disabled={loadingAction || isLoadingStockComparacion}
                  >
                    {isFetchedStockComparacion ? "Verificar de nuevo" : "Verificar ahora"}
                  </Button>
                  {isFetchedStockComparacion && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<SyncIcon />}
                      onClick={() => sincronizarTodoMutation.mutate()}
                      disabled={loadingAction || diferencias.length === 0}
                    >
                      Sincronizar todo
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>

            {isFetchedStockComparacion && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Codigo</TableCell>
                      <TableCell align="right">Producto u.</TableCell>
                      <TableCell align="right">Inventario u.</TableCell>
                      <TableCell align="right">Dif. u.</TableCell>
                      <TableCell align="right">Producto cajas</TableCell>
                      <TableCell align="right">Inventario cajas</TableCell>
                      <TableCell align="right">Peso dif.</TableCell>
                      <TableCell align="center">Accion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diferencias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No hay diferencias entre Producto e Inventario.
                        </TableCell>
                      </TableRow>
                    ) : (
                      diferencias.map((row) => (
                        <TableRow key={row.id_producto} hover>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {row.nombre}
                          </TableCell>
                          <TableCell>{row.codigo_barra || "N/A"}</TableCell>
                          <TableCell align="right">
                            {row.producto.subCantidad}
                          </TableCell>
                          <TableCell align="right">
                            {row.inventario.subCantidad}
                          </TableCell>
                          <TableCell align="right">
                            {row.diferencia.subCantidad}
                          </TableCell>
                          <TableCell align="right">{row.producto.stock}</TableCell>
                          <TableCell align="right">
                            {row.inventario.stock}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(row.diferencia.peso)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<SyncIcon />}
                              onClick={() =>
                                sincronizarProductoMutation.mutate(
                                  row.id_producto
                                )
                              }
                              disabled={loadingAction}
                            >
                              Sincronizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    Descuadre de stock real (por sucursal y lote)
                  </Typography>
                  <Typography color="text.secondary">
                    Compara, producto por producto y SUCURSAL por sucursal, el
                    inventario real contra lo que deberia haber segun compras,
                    ventas, salidas y transferencias registradas. Esto detecta
                    problemas que la comparacion de arriba (que solo mira el
                    total del producto) puede no mostrar, porque un lote puede
                    estar mal aunque el total se compense con otra sucursal.
                    No corrige nada automaticamente — revisa cada caso antes
                    de hacer un ajuste manual.
                  </Typography>
                  {isFetchedDescuadreStock && (
                    <Typography sx={{ mt: 1 }}>
                      {descuadreStock?.totalFilasRevisadas || 0} combinacion(es)
                      producto/sucursal revisada(s),{" "}
                      <strong
                        style={{
                          color:
                            (descuadreStock?.totalConDiferencia || 0) > 0
                              ? "#d32f2f"
                              : "#2e7d32",
                        }}
                      >
                        {descuadreStock?.totalConDiferencia || 0} con diferencia
                      </strong>
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={
                    isLoadingDescuadreStock ? (
                      <CircularProgress size={16} />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={() => refetchDescuadreStock()}
                  disabled={loadingAction || isLoadingDescuadreStock}
                >
                  {isFetchedDescuadreStock ? "Verificar de nuevo" : "Verificar ahora"}
                </Button>
              </Box>
            </Paper>

            {isFetchedDescuadreStock && (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Codigo</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell align="right">Stock real</TableCell>
                      <TableCell align="right">Compras</TableCell>
                      <TableCell align="right">Saldo inicial</TableCell>
                      <TableCell align="right">Stock esperado</TableCell>
                      <TableCell align="right">Diferencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {descuadresPorSucursal.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No hay diferencias entre el stock real y lo esperado
                          segun el historial.
                        </TableCell>
                      </TableRow>
                    ) : (
                      descuadresPorSucursal.map((row) => (
                        <TableRow
                          key={`${row.id_producto}-${row.id_sucursal}`}
                          hover
                        >
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {row.nombre}
                          </TableCell>
                          <TableCell>{row.codigo_barra || "N/A"}</TableCell>
                          <TableCell>{row.sucursal}</TableCell>
                          <TableCell align="right">{row.stockReal}</TableCell>
                          <TableCell align="right">{row.totalCompras}</TableCell>
                          <TableCell align="right">
                            {row.totalSaldoInicial || 0}
                          </TableCell>
                          <TableCell align="right">{row.stockEsperado}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              color: row.diferencia > 0 ? "#d32f2f" : "#ed6c02",
                            }}
                          >
                            {row.diferencia > 0 ? "+" : ""}
                            {row.diferencia}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    Lotes sobrevendidos
                  </Typography>
                  <Typography color="text.secondary">
                    Para cada lote compara lo comprado contra lo vendido mas
                    las salidas sin venta/transferencias. Como el inventario
                    no puede bajar de 0, un lote sobrevendido queda en 0 en
                    vez del negativo que le corresponderia, y esa diferencia
                    es justamente lo que hace que el stock real del producto
                    quede por encima de lo que predice el historial.
                  </Typography>
                  {isFetchedLotesSobrevendidos && (
                    <Typography sx={{ mt: 1 }}>
                      {lotesSobrevendidos?.totalLotesSobrevendidos || 0} lote(s)
                      sobrevendido(s)
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={
                    isLoadingLotesSobrevendidos ? (
                      <CircularProgress size={16} />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={() => refetchLotesSobrevendidos()}
                  disabled={loadingAction || isLoadingLotesSobrevendidos}
                >
                  {isFetchedLotesSobrevendidos
                    ? "Verificar de nuevo"
                    : "Verificar ahora"}
                </Button>
              </Box>
            </Paper>

            {isFetchedLotesSobrevendidos && (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Sucursal</TableCell>
                      <TableCell align="right">Comprado</TableCell>
                      <TableCell align="right">Vendido</TableCell>
                      <TableCell align="right">Salida</TableCell>
                      <TableCell align="right">Stock real</TableCell>
                      <TableCell align="right">Sobreventa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lotesSobrevendidosList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No hay lotes sobrevendidos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lotesSobrevendidosList.map((row) => (
                        <TableRow key={row.id_lote} hover>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {row.nombre}
                          </TableCell>
                          <TableCell>
                            {row.numero_lote || row.id_lote}
                          </TableCell>
                          <TableCell>{row.sucursal}</TableCell>
                          <TableCell align="right">{row.comprado}</TableCell>
                          <TableCell align="right">{row.vendido}</TableCell>
                          <TableCell align="right">{row.salida}</TableCell>
                          <TableCell align="right">{row.stockReal}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: "bold", color: "#d32f2f" }}
                          >
                            +{row.sobreventa}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 2,
                mt: 3,
              }}
            >
              <TableContainer component={Paper}>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Inventarios huerfanos
                  </Typography>
                  <Typography color="text.secondary">
                    Registros de Inventario que apuntan a un producto o lote que
                    ya no existe.
                  </Typography>
                </Box>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>ID inventario</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Problema</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventariosHuerfanos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay inventarios huerfanos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventariosHuerfanos.map((row) => (
                        <TableRow key={row.id_inventario} hover>
                          <TableCell>{row.id_inventario}</TableCell>
                          <TableCell>
                            {row.producto || `ID ${row.id_producto || "N/A"}`}
                          </TableCell>
                          <TableCell>
                            {row.numero_lote || `ID ${row.id_lote || "N/A"}`}
                          </TableCell>
                          <TableCell>
                            {[
                              row.faltaProducto ? "Producto faltante" : null,
                              row.faltaLote ? "Lote faltante" : null,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper}>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Inventarios negativos
                  </Typography>
                  <Typography color="text.secondary">
                    Inventarios con cajas, unidades o peso por debajo de cero.
                  </Typography>
                </Box>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>ID inventario</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell align="right">Cajas</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventariosNegativos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay inventarios negativos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventariosNegativos.map((row) => (
                        <TableRow key={row.id_inventario} hover>
                          <TableCell>{row.id_inventario}</TableCell>
                          <TableCell>
                            {row.producto || `ID ${row.id_producto || "N/A"}`}
                          </TableCell>
                          <TableCell>
                            {row.numero_lote || `ID ${row.id_lote || "N/A"}`}
                          </TableCell>
                          <TableCell align="right">{row.cantidad}</TableCell>
                          <TableCell align="right">{row.subCantidad}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 2,
                mt: 3,
              }}
            >
              <TableContainer component={Paper}>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Compras duplicadas sospechosas
                  </Typography>
                  <Typography color="text.secondary">
                    Misma compra repetida con producto, proveedor, cantidad,
                    precio y fecha iguales.
                  </Typography>
                </Box>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                      <TableCell align="right">Veces</TableCell>
                      <TableCell>IDs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comprasDuplicadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No se detectaron compras duplicadas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      comprasDuplicadas.slice(0, 20).map((row) => (
                        <TableRow key={row.ids_detalle.join("-")} hover>
                          <TableCell>{row.producto || row.id_producto}</TableCell>
                          <TableCell align="right">{row.subCantidad}</TableCell>
                          <TableCell align="right">{row.repeticiones}</TableCell>
                          <TableCell>{row.ids_detalle.join(", ")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper}>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Movimientos duplicados sospechosos
                  </Typography>
                  <Typography color="text.secondary">
                    Mismo movimiento repetido con producto, lote, cantidad y
                    fecha iguales.
                  </Typography>
                </Box>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Unidades</TableCell>
                      <TableCell align="right">Veces</TableCell>
                      <TableCell>IDs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movimientosDuplicados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No se detectaron movimientos duplicados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimientosDuplicados.slice(0, 20).map((row) => (
                        <TableRow key={row.ids_movimiento.join("-")} hover>
                          <TableCell>{row.producto || row.id_producto}</TableCell>
                          <TableCell>{row.tipo_movimiento}</TableCell>
                          <TableCell align="right">{row.subCantidad}</TableCell>
                          <TableCell align="right">{row.repeticiones}</TableCell>
                          <TableCell>{row.ids_movimiento.join(", ")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  Productos con proveedores distintos en sus lotes
                </Typography>
                <Typography color="text.secondary">
                  Un mismo producto con lotes de distinto proveedor (o sin
                  proveedor) aparece fragmentado al buscarlo para vender.
                  Corrígelo editando el proveedor de cada lote en{" "}
                  <strong>Almacenes → Ver producto</strong>.
                </Typography>
              </Box>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Proveedores encontrados</TableCell>
                    <TableCell align="right">Unidades totales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proveedoresDivergentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay productos con proveedores distintos entre sus
                        lotes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    proveedoresDivergentes.slice(0, 30).map((producto) => (
                      <TableRow key={producto.id_producto} hover>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {producto.nombre}
                        </TableCell>
                        <TableCell>
                          {producto.proveedores
                            .map(
                              (p) => `${p.nombre} (${p.unidades}u, ${p.lotes} lote${p.lotes === 1 ? "" : "s"})`
                            )
                            .join(" · ")}
                        </TableCell>
                        <TableCell align="right">
                          {producto.totalUnidades}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DrawerComponent>
  );
}

export default Ajustes;
