import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import useStyles from "./tableProductSelect.styles";
import ClienteAutocompleteComponent from "../ClienteAutocompleteComponent";
import ProductoAutocompleteComponent from "../ProductoAutocompleteComponent";
import MetodoPagoComponent from "../MetodoPagoComponent";
import DeleteForeverTwoToneIcon from "@mui/icons-material/DeleteForeverTwoTone";
import CloseIcon from "@mui/icons-material/Close";
const ProductSelectedComponent = ({
  productosSeleccionados,
  productosDetallados,
  setTotalPrice,
  setProductosDetallados,
  handleCancelar,
  clientes,
  ventaData,
  setCliente,
  handleOpenClientModal,
  productosUnicosFiltrados,
  handleProductoChange,
  setCantidad,
  setCantidadPorUnidad,
  metodoPago,
  setMetodoPago,
  movimientoInventario,
}) => {
  const classes = useStyles();

  const calcularPrecio = (producto) => {
    if (producto.precioManual) {
      return producto.precioManual;
    }
    if (producto.metodoSeleccionado) {
      return producto.metodoSeleccionado.precio || 0;
    }

    return producto.loteMasAntiguo.lote.precioVenta || 0;
  };

  const calcularCantidadActiva = (producto) => {
    if (producto.metodoSeleccionado) {
      if (producto.pesoMetodoCantidad) {
        return producto.pesoMetodoCantidad || 0;
      }
      return producto.cantidadMetodo || 0;
    }

    const cantidadActiva =
      producto.cantidadPorUnidad ||
      producto.peso ||
      producto.cantidad ||
      producto.cantidadMetodo ||
      0;
    return cantidadActiva;
  };

  const calcularSumaTotal = () =>
    productosDetallados.reduce((total, producto) => {
      const precio = calcularPrecio(producto);
      const cantidadActiva = calcularCantidadActiva(producto);
      if (producto.precioManual) {
        return total + precio;
      }
      return total + precio * cantidadActiva;
    }, 0);

  useEffect(() => {
    const total = calcularSumaTotal();

    setTotalPrice(total);
  }, [productosDetallados, setTotalPrice]);

  const handleInputChange = (
    index,
    field,
    value,
    maxValue,
    peso_por_metodo
  ) => {
    const newValue = Math.min(value, maxValue);
    const updatedProductos = [...productosDetallados];
    if (peso_por_metodo) {
      updatedProductos[index] = {
        ...updatedProductos[index],
        [field]: typeof value === "number" ? newValue : value,
        pesoMetodo: newValue * peso_por_metodo,
      };
    } else {
      updatedProductos[index] = {
        ...updatedProductos[index],
        [field]: typeof value === "number" ? newValue : value,
      };
    }

    setProductosDetallados(updatedProductos);
  };

  const handleDelete = (index) => {
    const updatedProductos = productosDetallados.filter((_, i) => i !== index);
    setProductosDetallados(updatedProductos);
  };

  const productosConTotales = productosUnicosFiltrados.map((producto) => {
    const totalCantidad = producto.inventarios.reduce(
      (acc, inv) => acc + (inv.cantidad || 0),
      0
    );
    const totalSubCantidad = producto.inventarios.reduce(
      (acc, inv) => acc + (inv.subCantidad || 0),
      0
    );
    return {
      ...producto,
      totalCantidad,
      totalSubCantidad,
    };
  });

  return (
    <TableContainer component={Paper}>
      <TableRow sx={{ width: "100%", display: "flex" }}>
        <TableCell className={classes.cell} sx={{ flex: "0.8" }}>
          <ProductoAutocompleteComponent
            productosUnicosFiltrados={productosUnicosFiltrados}
            ventaData={ventaData}
            handleProductoChange={handleProductoChange}
            setCantidad={setCantidad}
            setCantidadPorUnidad={setCantidadPorUnidad}
            productosConTotales={productosConTotales}
          />
        </TableCell>
        <TableCell className={classes.cell} sx={{ flex: "0.5" }}>
          {!movimientoInventario ? (
            <MetodoPagoComponent
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
            />
          ) : null}
        </TableCell>
        <TableCell className={classes.cell} sx={{ flex: "0.5" }}>
          <ClienteAutocompleteComponent
            clientes={clientes}
            ventaData={ventaData}
            setCliente={setCliente}
            handleOpenClientModal={handleOpenClientModal}
            productosSeleccionados={productosSeleccionados}
          />
        </TableCell>
      </TableRow>

      <Table
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <TableHead>
          <TableRow className={classes.tableHeader}>
            {[
              "Producto",
              "uso rest.",
              "Precio",
              "Cant. por unidad",
              "Stock",
              "Eliminar",
            ].map((header, index) => (
              <TableCell
                key={index}
                sx={{
                  fontWeight: "bold",
                  width: "16.6%",
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(productosDetallados) &&
            productosDetallados?.length > 0 &&
            productosDetallados?.map((producto, index) => {
              const { cantUnitLimit, pesoLimit, newValue, metodoSeleccionado } =
                producto;
              const totalSubCantidad = producto?.newValue?.totalSubCantidad;
              console.log(newValue);

              return (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      fontSize: ".8rem",
                    }}
                  >
                    {newValue?.nombre} {newValue?.forma_farmaceutica}{" "}
                    {newValue?.concentracion}
                  </TableCell>
                  <TableCell
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    {newValue?.uso_res ? "si" : "no"}{" "}
                  </TableCell>
                  <TableCell sx={{ color: "green" }}>
                    <>
                      {metodoSeleccionado
                        ? metodoSeleccionado.precio
                        : newValue?.inventarios[0]?.lote?.precioVenta}{" "}
                      Bs
                    </>
                  </TableCell>

                  <TableCell>
                    {cantUnitLimit !== 0 && pesoLimit <= 0 && (
                      <>
                        <TextField
                          type="number"
                          value={producto.cantidadPorUnidad || ""}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "cantidadPorUnidad",
                              parseInt(e.target.value),
                              totalSubCantidad
                            )
                          }
                          sx={{ width: "40%" }}
                          inputProps={{
                            max: totalSubCantidad,
                          }}
                          fullWidth
                        />
                      </>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#66cc66",
                        width: "40%",
                        padding: ".5rem 0 .5rem 0",
                        borderRadius: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {totalSubCantidad}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDelete(index)}
                      //variant="contained"
                      color="error"
                    >
                      <CloseIcon sx={{ color: "red", fontSize: "2rem" }} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TableRow>
        {movimientoInventario ? null : (
          <TableCell
            sx={{ fontWeight: "bold", fontSize: "2rem", color: "green" }}
            colSpan={1}
          >
            Total
          </TableCell>
        )}
        {movimientoInventario ? null : (
          <TableCell
            sx={{ fontWeight: "bold", fontSize: "2rem", color: "green" }}
            colSpan={3}
          >
            {calcularSumaTotal()} Bs
          </TableCell>
        )}

        <TableCell sx={{ fontWeight: "bold" }} colSpan={1}>
          <Button
            variant="contained"
            style={{
              backgroundColor: "red",
              color: "#fff",
              fontWeight: "bold",
              width: "10rem",
            }}
            fullWidth
            onClick={handleCancelar}
          >
            Cancelar
          </Button>
        </TableCell>
      </TableRow>
    </TableContainer>
  );
};

export default ProductSelectedComponent;
