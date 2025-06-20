import React, { useState, useEffect, useContext } from "react";
import { Button, Grid, Box, Snackbar, TextField } from "@mui/material";
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

const RegisterBuyComponent = ({
  products,
  proveedores,
  refetchProducts,
  refetchProveedores,
  lotes,
  refetchLote,
}) => {
  const classes = useStyles();
  const { user } = useContext(MainContext);

  const [lote, setLote] = useState("");
  const [loteNumber, setLoteNumber] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [producto, setProducto] = useState("");
  const [productoName, setProductoName] = useState("");
  const [proveedorName, setProveedorName] = useState("");
  const [cantidad, setCantidad] = useState(null);
  const [precio, setPrecio] = useState(null);
  const [peso, setPeso] = useState(null);
  const [subCantidad, setSubCantidad] = useState(null);
  const [registroCombinado, setRegistroCombinado] = useState([]);
  const [detalleCompraId, setDetalleCompraId] = useState(null);
  const [error, setError] = useState();
  const [isLoteProveedorLocked, setIsLoteProveedorLocked] = useState(false);
  const [precioVenta, setPrecioVenta] = useState(null);

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

  // const detalleCompraMutation = useMutation(detalleCompraAddServices, {
  //   onSuccess: (response) => {
  //     setDetalleCompraId(response.id_detalle);
  //     const newLote = {
  //       id_producto: producto,
  //       numero_lote: lote,
  //       fecha_ingreso: getLocalDateTime(),
  //       fecha_caducidad: fechaCaducidad,
  //       cantidad: cantidad ? cantidad : 0,
  //       precio_unitario: precio,
  //       peso: peso ? peso : 0,
  //       subCantidad: subCantidad ? subCantidad * cantidad : cantidad * 1,
  //       cantidadPorCaja: subCantidad > 0 ? subCantidad : 1,
  //       id_detalle_compra: response.id_detalle,
  //     };
  //     loteMutation.mutate(newLote);
  //   },
  //   onError: (error) => {
  //     setSnackbar({
  //       open: true,
  //       message: `Error al guardar el detalle de compra: ${error.message}`,
  //       severity: "error",
  //     });
  //   },
  // });

  // const loteMutation = useMutation(loteAddServices, {
  //   onSuccess: () => {
  //     setSnackbar({
  //       open: true,
  //       message: "Lote creado exitosamente!",
  //       severity: "success",
  //     });
  //     setLoteNumber(lote);
  //     setIsLoteProveedorLocked(true);
  //     setFechaIngreso("");
  //     setFechaCaducidad("");
  //     setCantidad("");
  //     setPrecio("");
  //     setSubCantidad(null);
  //     setPeso("");
  //     setDetalleCompraId(null);
  //   },
  //   onError: (error) => {
  //     setSnackbar({
  //       open: true,
  //       message: `Error al crear el lote: ${error.message}`,
  //       severity: "error",
  //     });
  //   },
  // });

  const handleSave = () => {
    setLoteNumber(lote);
    const newBuy = {
      producto: productoName,
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
    },
    onError: (error) => {
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
    const transformedArray = registroCombinado.map((item, index) => ({
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
