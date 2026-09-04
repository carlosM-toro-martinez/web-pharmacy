import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Grid,
  Box,
  Snackbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { useMutation } from "react-query";
import ClientModal from "./ClientModal";
import VentaForm from "./VentaForm";
import useStyles from "./dashboardVenta.styles";
import { getLocalDateTime } from "../../utils/getDate";
import { MainContext } from "../../context/MainContext";
import ventaCompletaService from "../../async/services/post/ventaCompletaService";
import CalculatorComponent from "./VentaForm/CalculatorComponent";
import salidaInventarioAddService from "../../async/services/post/salidaInventarioAddService";
import TicketComponent from "./TicketComponent";
import { useReactToPrint } from "react-to-print";
import BuscarOtraSucursalModal from "./BuscarOtraSucursalModal";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

function DashboardVentaComponent({
  products,
  refetchProducts,
  clients,
  refetchClients,
  caja,
  refetchCaja,
  movimientoInventario,
  refetchVentas,
}) {
  const ventaFormRef = useRef(null);
  const denominacionFormRef = useRef(null);

  const classes = useStyles();
  const { user } = useContext(MainContext);

  const [ventaData, setVentaData] = useState({
    id_trabajador: user?.id_trabajador,
    clienteId: "",
  });
  const [precio, setPrecio] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [lote, setLote] = useState();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openClientModal, setOpenClientModal] = useState(false);
  const [openBuscarSucursal, setOpenBuscarSucursal] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cancelForm, setCancelForm] = useState(null);
  const [restore, setRestoreDenom] = useState(null);
  const [cantLimit, setCantLimit] = useState(0);
  const [pesoLimit, setPesoLimit] = useState(0);
  const [cantUnitLimit, setCantUnitLimit] = useState(0);
  const [productosDetallados, setProductosDetallados] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldMutate, setShouldMutate] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Contado");
  const handleOpenClientModal = () => setOpenClientModal(true);
  const handleCloseClientModal = () => setOpenClientModal(false);

  const addProducto = (
    producto,
    cliente,
    loteID,
    price,
    cantidadPorUnidad,
    cantidad
  ) => {
    setProductosSeleccionados((prev) => {
      return [
        ...prev,
        {
          ...producto,
          clienteNombre: `${cliente.nombre} ${
            cliente.apellido ? cliente.apellido : ""
          } - ${cliente.codigo ? cliente.codigo : ""}`,
          clienteId: cliente.id_cliente,
          clientePuntos: cliente.puntos_fidelidad,
          id_lote: loteID,
          precio: price,
          cantidad_unidad: cantidadPorUnidad ? cantidadPorUnidad : 0,
          cantidad: cantidad ? cantidad : 0,
          id_trabajador: user?.id_trabajador,
        },
      ];
    });

    actualizarTotal(productosSeleccionados);
  };

  const removeProducto = (index) => {
    setProductosSeleccionados((prev) => prev.filter((_, i) => i !== index));
    actualizarTotal(productosSeleccionados);
  };

  const actualizarTotal = (productos) => {
    const nuevoTotal = productos.reduce(
      (total, producto) => total + parseFloat(producto.precio),
      0
    );
    setVentaData((prev) => ({ ...prev, total: nuevoTotal }));
  };

  const ventaMutation = useMutation(
    () => {
      function buscarPorIdLote(array, idLote) {
        return array.find((item) => item.lote && item.lote.id_lote === idLote);
      }

      function calcularCantidad(producto, inventarioLote) {
        const cantidad = Number(producto.cantidad) || 0;
        const cantidadUnidad = Number(producto.cantidad_unidad) || 0;
        const cantidadPorCaja =
          Number(inventarioLote?.lote?.cantidadPorCaja) || 0;
        const cantidadInventario = Number(inventarioLote?.subCantidad) || 0;

        if (cantidad > 0 && cantidadUnidad <= 0) {
          return cantidad;
        }

        if (cantidadUnidad > 0 && !inventarioLote?.lote) {
          return 0;
        }

        if (cantidadUnidad <= 0 || cantidadPorCaja <= 0) {
          return 0;
        }

        if (cantidadPorCaja > cantidadUnidad) {
          return cantidadInventario === cantidadUnidad ? 1 : 0;
        }

        return Math.floor(cantidadUnidad / cantidadPorCaja);
      }
      const payload = {
        ventaData: {
          fecha_venta: getLocalDateTime(),
          total: totalPrice,
          id_cliente: ventaData.clienteId,
          id_trabajador: ventaData.id_trabajador,
          id_sucursal: caja?.caja?.id_sucursal || user?.id_sucursal || null,
          rebaja_aplicada: 0,
          descuento_fidelidad_aplicado: 0,
          metodo_pago: metodoPago,
        },
        id_caja: caja?.caja?.id_caja || 1,
        detalles: productosSeleccionados.map((p) => {
          const inventarioLote = buscarPorIdLote(p?.inventarios || [], p.id_lote);

          return {
            id_producto: p.id_producto,
            id_lote: p.id_lote,
            cantidad: calcularCantidad(p, inventarioLote),
            cantidad_unidad: Number(p.cantidad_unidad) || 0,
            descripcion: p.descripcion,
            precio: Number(p.precio) || 0,
            clienteId: ventaData.clienteId,
          };
        }),
      };

      if (movimientoInventario) {
        return salidaInventarioAddService(payload);
      } else {
        return ventaCompletaService(payload);
      }
    },
    {
      onSuccess: (response) => {
        setSnackbar({
          open: true,
          message: movimientoInventario
            ? "Movimiento realizado exitosamente!"
            : "Venta realizada exitosamente!",
          severity: "success",
        });
        refetchProducts();
        refetchCaja();
        refetchVentas?.();
        if (cancelForm) cancelForm();
        if (setRestoreDenom) setRestoreDenom();
        // handlePrint();
        setLoading(false);
      },
      onError: (error) => {
        setProductosSeleccionados([]);
        setLoading(false);

        // Si fallo por stock insuficiente (u otro motivo), la vista de
        // inventario que tiene el trabajador puede estar desactualizada
        // (por ej. otra venta consumio el mismo lote mientras esta pantalla
        // seguia abierta) — se refresca para que el proximo intento use
        // datos reales, en vez de dejar el mismo dato viejo que ya fallo.
        refetchProducts();

        setSnackbar({
          open: true,
          message: `Error al procesar la venta: ${
            error?.message || error || "Intente nuevamente."
          }`,
          severity: "error",
        });
      },
    }
  );

  const handleSubmit = async () => {
    if (loading || isProcessing || ventaMutation.isLoading) {
      return;
    }

    if (!totalPrice || totalPrice <= 0) {
      setSnackbar({
        open: true,
        message: "No se puede registrar una venta vacía.",
        severity: "error",
      });
      return;
    }

    if (!ventaData.clienteId) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar un cliente para registrar la venta.",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    setIsProcessing(true);
    setShouldMutate(false);

    for (const item of productosDetallados) {
      const producto = item.newValue;
      const lotesProducto = item.lotesFiltrados;
      const price = parseFloat(
        item.loteMasAntiguo?.lote?.precioVenta || producto?.precio || 0
      );
      const cantidadPorUnidad = item.cantidadPorUnidad;
      const cantidadPorCaja = item.cantidadPorCaja;
      const cantidad = item.cantidad;
      const metodoSeleccionado = item.metodoSeleccionado;
      const cantidadMetodo = item.cantidadMetodo;
      const precioManual = item.precioManual;

      await procesarVenta(
        producto,
        lotesProducto,
        cantidadPorUnidad,
        cantidadPorCaja,
        price,
        cantidad,
        metodoSeleccionado,
        cantidadMetodo,
        precioManual
      );
    }

    setIsProcessing(false);
    setShouldMutate(true);
  };

  const procesarVenta = (
    newValue,
    lotesProducto,
    cantidadPorUnidad,
    cantidadPorCaja,
    price,
    cantidad,
    metodoSeleccionado,
    cantidadMetodo,
    precioManual
  ) => {
    const productoSeleccionado = products.find(
      (producto) => producto.id_producto === newValue.id_producto
    );
    const clienteSeleccionado = clients.find(
      (cliente) => cliente.id_cliente === ventaData.clienteId
    );

    if (!productoSeleccionado || !clienteSeleccionado) {
      console.error("Producto o cliente no encontrado");
      return;
    }

    let cajasRestantes = cantidadPorUnidad && cantidadPorCaja > 0
      ? Math.floor(cantidadPorUnidad / cantidadPorCaja)
      : cantidad || 0;

    let priceProduct = precio || precioManual || price;

    const lotesOrdenados = [...lotesProducto].sort(
      (a, b) => (a.lote?.id_lote || 0) - (b.lote?.id_lote || 0)
    );

    const procesarLotes = (condicion, operacion) => {
      for (let i = 0; i < lotesOrdenados.length; i++) {
        let loteData = lotesOrdenados[i];
        if (condicion(loteData)) {
          operacion(loteData);
        } else {
          break;
        }
      }
    };

    if (metodoSeleccionado && cantidadMetodo) {
      let unidadesRestantes =
        cantidadMetodo * metodoSeleccionado.cantidad_por_metodo;
      let precioMetodo =
        metodoSeleccionado.precio / metodoSeleccionado.cantidad_por_metodo;
      let cantidadCajas = unidadesRestantes / cantidadPorCaja;
      procesarLotes(
        (loteData) => unidadesRestantes > 0,
        (loteData) => {
          if (unidadesRestantes >= loteData.subCantidad) {
            cantidadCajas -= loteData.cantidad;
            unidadesRestantes -= loteData.subCantidad;
            addProducto(
              productoSeleccionado,
              clienteSeleccionado,
              loteData.lote?.id_lote || null,
              precioMetodo,
              loteData.subCantidad,
              loteData.cantidad
            );
          } else {
            addProducto(
              productoSeleccionado,
              clienteSeleccionado,
              loteData.lote?.id_lote || null,
              precioMetodo,
              unidadesRestantes,
              Math.floor(cantidadCajas)
            );

            unidadesRestantes = 0;
          }
        }
      );
    } else {
      switch (true) {
        case cantidadPorUnidad && !cantidad:
          procesarLotes(
            (loteData) => cantidadPorUnidad > 0,
            (loteData) => {
              if (cantidadPorUnidad >= loteData.subCantidad) {
                cajasRestantes -= loteData.cantidad;
                cantidadPorUnidad -= loteData.subCantidad;
                addProducto(
                  productoSeleccionado,
                  clienteSeleccionado,
                  loteData.lote?.id_lote || null,
                  priceProduct,
                  loteData.subCantidad,
                  loteData.cantidad
                );
              } else {
                addProducto(
                  productoSeleccionado,
                  clienteSeleccionado,
                  loteData.lote?.id_lote || null,
                  priceProduct,
                  cantidadPorUnidad,
                  cajasRestantes
                );
                cantidadPorUnidad = 0;
              }
            }
          );
          break;

        case cantidad && !cantidadPorUnidad:
          procesarLotes(
            (loteData) => cantidad > 0,
            (loteData) => {
              if (cantidad >= loteData.cantidad) {
                cantidad -= loteData.cantidad;
                addProducto(
                  productoSeleccionado,
                  clienteSeleccionado,
                  loteData.lote?.id_lote || null,
                  priceProduct,
                  0,
                  loteData.cantidad
                );
              } else {
                addProducto(
                  productoSeleccionado,
                  clienteSeleccionado,
                  loteData.lote?.id_lote || null,
                  priceProduct,
                  0,
                  cantidad
                );
                cantidad = 0;
              }
            }
          );
          break;

        default:
          console.log("Ningún caso cumple con los criterios establecidos.");
          break;
      }
    }
  };

  useEffect(() => {
    if (!isProcessing && shouldMutate) {
      ventaMutation.mutate();
      setShouldMutate(false);
      setPrecio();
    }
  }, [isProcessing, shouldMutate, productosSeleccionados]);

  useEffect(() => {
    if (ventaFormRef.current) {
      ventaFormRef.current.focus();
    }
    if (denominacionFormRef.current) {
      denominacionFormRef.current.focus();
    }
  }, []);
  const contentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef,
  });

  return (
    <Box style={{ minWidth: "100%" }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Typography
          variant="h3"
          className={classes.header}
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {movimientoInventario ? " Movimiento de inventario" : "Registrar Venta"}
        </Typography>
        {!movimientoInventario && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<TravelExploreIcon />}
            onClick={() => setOpenBuscarSucursal(true)}
            sx={{ position: "absolute", right: 0 }}
          >
            Buscar en otra sucursal
          </Button>
        )}
      </Box>
      {openBuscarSucursal && (
        <BuscarOtraSucursalModal
          open={openBuscarSucursal}
          handleClose={() => setOpenBuscarSucursal(false)}
        />
      )}
      <Grid container spacing={1}>
        <Grid item xs={11} md={12} ref={ventaFormRef}>
          <VentaForm
            ventaData={ventaData}
            clientes={clients}
            productos={products}
            setVentaData={setVentaData}
            setCliente={(id) =>
              setVentaData((prev) => ({ ...prev, clienteId: id }))
            }
            setProducto={(id) =>
              setVentaData((prev) => ({ ...prev, productoId: id }))
            }
            addProducto={addProducto}
            handleOpenClientModal={handleOpenClientModal}
            setProductosSeleccionados={setProductosSeleccionados}
            productosSeleccionados={productosSeleccionados}
            lote={lote}
            setLote={setLote}
            setCancelForm={setCancelForm}
            cantLimit={cantLimit}
            setCantLimit={setCantLimit}
            cantUnitLimit={cantUnitLimit}
            setCantUnitLimit={setCantUnitLimit}
            pesoLimit={pesoLimit}
            setPesoLimit={setPesoLimit}
            removeProducto={removeProducto}
            setTotalPrice={setTotalPrice}
            productosDetallados={productosDetallados}
            setProductosDetallados={setProductosDetallados}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            movimientoInventario={movimientoInventario}
            totalPrice={totalPrice}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          margin: ".5rem 0 2rem 0",
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "start",
        }}
      >
        <CalculatorComponent totalPrice={totalPrice} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || isProcessing || ventaMutation.isLoading}
          sx={{
            minWidth: "14rem",
            minHeight: "3rem",
            fontWeight: "bold",
          }}
        >
          {loading || isProcessing || ventaMutation.isLoading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Procesando...
            </>
          ) : movimientoInventario ? (
            "Registrar Movimiento"
          ) : (
            "Registrar Venta"
          )}
        </Button>
      </Box>
      <ClientModal
        refetchClients={refetchClients}
        open={openClientModal}
        handleClose={handleCloseClientModal}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            fontSize: "1.8rem",
            padding: "16px 24px",
            alignItems: "center",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <div>
        <div style={{ display: "none" }}>
          <TicketComponent
            ref={contentRef}
            productos={productosDetallados}
            totalPrice={totalPrice}
          />
        </div>
      </div>
    </Box>
  );
}

export default DashboardVentaComponent;
