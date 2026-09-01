import React, { useState, useEffect, useContext } from "react";
import { Button, Grid, Box, Snackbar, TextField, Autocomplete } from "@mui/material";
import Alert from "@mui/material/Alert";
import LoteFormComponent from "./LoteFormComponent";
import ProductoProveedorForm from "./ProductoProveedorForm";
import RegistroTableComponent from "./RegistroTableComponent";
import ProveedorModalComponent from "./ProveedorModalComponent";
import ProductoModalComponent from "./ProductoModalComponent";
import useStyles from "./RegisterBuy.styles";
// import detalleCompraAddServices from "../../async/services/post/detalleCompraAddServices";
// import loteAddServices from "../../async/services/post/loteAddServices";
// import buyLoteService from "../../async/services/get/buyLoteService";
import { useMutation, useQuery } from "react-query";
import { getLocalDateTime } from "../../utils/getDate";
import { MainContext } from "../../context/MainContext";
import { Typography } from "@mui/material";
import buyAddService from "../../async/services/post/buyAddService";
import {
  loadAlmacenesDraft,
  saveAlmacenesDraft,
  clearAlmacenesDraft,
} from "../../utils/almacenesDraftStorage";

const RegisterBuyComponent = ({
  products,
  proveedores,
  refetchProducts,
  refetchProveedores,
  lotes,
  refetchLote,
}) => {
  const classes = useStyles();
  const { user, sucursal } = useContext(MainContext);
  const idSucursal = sucursal?.id_sucursal || user?.id_sucursal || null;

  const draft = loadAlmacenesDraft();

  const [lote, setLote] = useState(draft?.lote ?? "");
  const [loteNumber, setLoteNumber] = useState(draft?.loteNumber ?? "");
  const [fechaIngreso, setFechaIngreso] = useState(draft?.fechaIngreso ?? "");
  const [fechaCaducidad, setFechaCaducidad] = useState(
    draft?.fechaCaducidad ?? ""
  );
  const [proveedor, setProveedor] = useState(draft?.proveedor ?? "");
  const [producto, setProducto] = useState(draft?.producto ?? "");
  const [productoName, setProductoName] = useState(draft?.productoName ?? "");
  const [proveedorName, setProveedorName] = useState(
    draft?.proveedorName ?? ""
  );
  const [cantidad, setCantidad] = useState(draft?.cantidad ?? null);
  const [precio, setPrecio] = useState(draft?.precio ?? null);
  const [peso, setPeso] = useState(draft?.peso ?? null);
  const [subCantidad, setSubCantidad] = useState(draft?.subCantidad ?? null);
  const [registroCombinado, setRegistroCombinado] = useState(
    draft?.registroCombinado ?? []
  );
  const [detalleCompraId, setDetalleCompraId] = useState(null);
  const [error, setError] = useState();
  const [isLoteProveedorLocked, setIsLoteProveedorLocked] = useState(
    draft?.isLoteProveedorLocked ?? false
  );
  const [precioVenta, setPrecioVenta] = useState(draft?.precioVenta ?? null);
  const [loadingBuy, setLoadingBuy] = useState(false);
  // Distribuidora + N° de factura: son de la COMPRA completa (la factura),
  // no de la linea/marca de cada producto (eso ya lo cubre "proveedor").
  const [proveedorFactura, setProveedorFactura] = useState(
    draft?.proveedorFactura ?? ""
  );
  const [numeroFactura, setNumeroFactura] = useState(
    draft?.numeroFactura ?? ""
  );

  useEffect(() => {
    saveAlmacenesDraft({
      lote,
      loteNumber,
      fechaIngreso,
      fechaCaducidad,
      proveedor,
      producto,
      productoName,
      proveedorName,
      cantidad,
      precio,
      peso,
      subCantidad,
      registroCombinado,
      isLoteProveedorLocked,
      precioVenta,
      proveedorFactura,
      numeroFactura,
    });
  }, [
    lote,
    loteNumber,
    fechaIngreso,
    fechaCaducidad,
    proveedor,
    producto,
    productoName,
    proveedorName,
    cantidad,
    precio,
    peso,
    subCantidad,
    registroCombinado,
    isLoteProveedorLocked,
    precioVenta,
    proveedorFactura,
    numeroFactura,
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openProveedorModal, setOpenProveedorModal] = useState(false);
  const [openProductoModal, setOpenProductoModal] = useState(false);

  const handleOpenProveedorModal = () => setOpenProveedorModal(true);
  const handleCloseProveedorModal = () => setOpenProveedorModal(false);

  const handleOpenProductoModal = () => setOpenProductoModal(true);
  const handleCloseProductoModal = () => setOpenProductoModal(false);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSave = () => {
    setLoteNumber(lote);
    const productoInfo = (products || []).find(
      (p) => p.id_producto === producto
    );
    const newBuy = {
      producto: productoName,
      concentracion: productoInfo?.concentracion || "",
      forma_farmaceutica: productoInfo?.forma_farmaceutica || "",
      proveedor: proveedorName,
      id_proveedor: proveedor,
      id_producto: producto,
      numero_lote: lote,
      cantidad: cantidad ? cantidad : 0,
      precio_unitario: precio,
      peso: peso ? peso : null,
      subCantidad: subCantidad ? subCantidad * cantidad : cantidad * 1,
      cantidadPorCaja: subCantidad > 0 ? subCantidad : 1,
      fecha_ingreso: getLocalDateTime(),
      fecha_compra: getLocalDateTime(),
      fecha_caducidad: fechaCaducidad,
      id_trabajador: user?.id_trabajador,
      precioVenta: precioVenta ? precioVenta : 0,
    };
    setRegistroCombinado((prevRegistro) => [...prevRegistro, newBuy]);
    setLoteNumber(lote);
    setIsLoteProveedorLocked(true);
    setFechaIngreso("");
    setFechaCaducidad("");
    setCantidad("");
    setPrecio("");
    setSubCantidad(null);
    setPeso("");
    setDetalleCompraId(null);
    setProducto(null);
    setProductoName("");
  };

  const buyMutation = useMutation(buyAddService, {
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Compra realizada exitosamente!",
        severity: "success",
      });
      setIsLoteProveedorLocked(false);
      setProveedor("");
      setLote("");
      setRegistroCombinado([]);
      setLoadingBuy(false);
      setProveedorFactura("");
      setNumeroFactura("");
      clearAlmacenesDraft();
    },
    onError: (error) => {
      setLoadingBuy(false);
      setSnackbar({
        open: true,
        message: `Error al realizar la compra: ${
          error.message || "Intenta de nuevo"
        }`,
        severity: "error",
      });
    },
  });

  const handleFinalize = () => {
    if (loadingBuy || buyMutation.isLoading) {
      return;
    }

    const seen = new Set();
    const filteredRegistro = registroCombinado.filter((item) => {
      if (seen.has(item.id_producto)) {
        return false;
      }
      seen.add(item.id_producto);
      return true;
    });
    setLoadingBuy(true);
    const transformedArray = filteredRegistro.map((item) => ({
      detalleCompraData: {
        id_proveedor: item.id_proveedor,
        id_producto: item.id_producto,
        numero_lote: item.numero_lote,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        peso: item.peso,
        subCantidad: item.subCantidad,
        cantidadPorCaja: item.cantidadPorCaja,
        fecha_ingreso: item.fecha_ingreso,
        fecha_compra: item.fecha_compra,
        fecha_caducidad: item.fecha_caducidad,
        id_trabajador: item?.id_trabajador,
        id_proveedor_factura: proveedorFactura || null,
        numero_factura: numeroFactura || null,
      },
      loteData: {
        id_proveedor: item.id_proveedor,
        id_producto: item.id_producto,
        numero_lote: item.numero_lote,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        peso: item.peso,
        subCantidad: item.subCantidad,
        cantidadPorCaja: item.cantidadPorCaja,
        fecha_ingreso: item.fecha_ingreso,
        fecha_compra: item.fecha_compra,
        fecha_caducidad: item.fecha_caducidad,
        id_trabajador: item?.id_trabajador,
        precioVenta: item?.precioVenta,
      },
      productId: item.id_producto,
      productUpdateData: {
        tipo_movimiento: "compra",
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        fecha_caducidad: item.fecha_caducidad,
        peso: item.peso,
        subCantidad: item.subCantidad,
        cantidadPorCaja: item.cantidadPorCaja,
        id_trabajador: item.id_trabajador,
        id_sucursal: idSucursal,
      },
    }));

    buyMutation.mutate(transformedArray);
  };

  return (
    <Box
      style={{
        minWidth: "100%",
        paddingLeft: "2rem",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={6} justifyContent={"center"}>
          <Grid item xs={12} md={12}>
            <Typography
              variant="h3"
              className={classes.header}
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: "2rem 0 .5rem 0",
              }}
            >
              Datos de la factura
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Autocomplete
                size="small"
                sx={{ minWidth: 220 }}
                options={proveedores || []}
                getOptionLabel={(option) => option?.nombre?.toUpperCase() || ""}
                isOptionEqualToValue={(option, value) =>
                  option.id_proveedor === value.id_proveedor
                }
                value={
                  (proveedores || []).find(
                    (p) => p.id_proveedor === proveedorFactura
                  ) || null
                }
                onChange={(event, newValue) =>
                  setProveedorFactura(newValue?.id_proveedor || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Distribuidora"
                    helperText="Quien emitió la factura de esta compra"
                  />
                )}
              />
              <TextField
                label="N° de factura"
                size="small"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                placeholder="Si lo dejas vacío se genera uno automático"
                sx={{ minWidth: 220 }}
                helperText="Opcional, si lo dejas vacío se genera uno automático"
              />
            </Box>
            <Typography
              variant="h3"
              className={classes.header}
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: "1rem 0 .5rem 0",
              }}
            >
              Registro de Lote
            </Typography>
            <ProductoProveedorForm
              setProductoName={setProductoName}
              setProveedorName={setProveedorName}
              proveedor={proveedor}
              setProveedor={setProveedor}
              producto={producto}
              setProducto={setProducto}
              productos={products}
              proveedores={proveedores}
              setError={setError}
              handleOpenProductoModal={handleOpenProductoModal}
              handleOpenProveedorModal={handleOpenProveedorModal}
              isLoteProveedorLocked={isLoteProveedorLocked}
              setLote={setLote}
              lote={lote}
              fechaCaducidad={fechaCaducidad}
              setFechaCaducidad={setFechaCaducidad}
              loteData={lotes}
              productoName={productoName}
            />
            <LoteFormComponent
              lote={lote}
              loteData={lotes}
              setLote={setLote}
              fechaIngreso={fechaIngreso}
              setFechaIngreso={setFechaIngreso}
              fechaCaducidad={fechaCaducidad}
              setFechaCaducidad={setFechaCaducidad}
              cantidad={cantidad}
              setCantidad={setCantidad}
              precio={precio}
              setPrecio={setPrecio}
              setError={setError}
              isLoteProveedorLocked={isLoteProveedorLocked}
              peso={peso}
              setPeso={setPeso}
              subCantidad={subCantidad}
              setSubCantidad={setSubCantidad}
              precioVenta={precioVenta}
              setPrecioVenta={setPrecioVenta}
            />
          </Grid>
          <Box sx={{ display: "flex", gap: 10 }}>
            <Button
              onClick={handleOpenProveedorModal}
              disabled={isLoteProveedorLocked}
              variant="contained"
              style={{
                marginTop: "20px",
                fontWeight: "bold",
                backgroundColor: "#2596be",
                borderRadius: "3rem",
              }}
            >
              Agregar proveedor
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loadingBuy || buyMutation.isLoading}
              style={{
                marginTop: "20px",
                fontWeight: "bold",
              }}
              // disabled={
              //   detalleCompraMutation.isLoading ||
              //   loteMutation.isLoading ||
              //   error
              // }
            >
              {/* {detalleCompraMutation.isLoading || loteMutation.isLoading
                ? "Guardando..."
                : "Añadir"} */}
              Añadir
            </Button>
            <Button
              onClick={handleOpenProductoModal}
              variant="contained"
              disabled={loadingBuy || buyMutation.isLoading}
              style={{
                marginTop: "20px",
                fontWeight: "bold",
                backgroundColor: "#2596be",
                borderRadius: "3rem",
              }}
            >
              Agregar producto
            </Button>
          </Box>
          <Grid item xs={11} md={11}>
            <RegistroTableComponent
              registroCombinado={registroCombinado}
              setRegistroCombinado={setRegistroCombinado}
              handleFinalize={handleFinalize}
              numeroLote={loteNumber}
              loadingBuy={loadingBuy}
              setLoadingBuy={setLoadingBuy}
            />
          </Grid>
        </Grid>
      </form>

      <ProveedorModalComponent
        refetchProveedores={refetchProveedores}
        open={openProveedorModal}
        handleClose={handleCloseProveedorModal}
      />
      <ProductoModalComponent
        refetchProducts={refetchProducts}
        open={openProductoModal}
        handleClose={handleCloseProductoModal}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterBuyComponent;
