import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ProductSelectedComponent from "./ProductSelectedComponent";
import { formatLapazDate } from "../../../utils/dateUtils";

const VentaForm = ({
  ventaData,
  setVentaData,
  clientes,
  productos,
  setProducto,
  setCliente,
  handleOpenClientModal,
  productosSeleccionados,
  setProductosSeleccionados,
  setLote,
  setCancelForm,
  setCantLimit,
  setCantUnitLimit,
  setPesoLimit,
  removeProducto,
  setTotalPrice,
  productosDetallados,
  setProductosDetallados,
  metodoPago,
  setMetodoPago,
  movimientoInventario,
  totalPrice,
}) => {
  const [lotesProducto, setLotesProducto] = useState([]);
  const [peso, setPeso] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantLote, setCantLote] = useState(null);
  const [cantidadPorUnidad, setCantidadPorUnidad] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [cantidadPorCaja, setCantidadPorCaja] = useState("");
  const [metodosVenta, setMetodosVenta] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [cantidadMetodo, setcantidadMetodo] = useState(null);

  useEffect(() => {
    const clienteDefecto = clientes.find((cliente) => cliente.id_cliente === 1);
    if (clienteDefecto) {
      setCliente(clienteDefecto.id_cliente);
    }
  }, [clientes]);

  const handleProductoChange = (productoId, newValue) => {
    const primerInventario = newValue?.inventarios?.[0];
    setMetodosVenta(
      primerInventario?.lote?.producto?.metodosVenta || newValue?.metodosVenta || []
    );

    setProducto(productoId);

    const lotesFiltrados = (newValue?.inventarios || []).filter(
      (inv) =>
        Number(inv.cantidad) > 0 ||
        Number(inv.subCantidad) > 0 ||
        Number(inv.peso) > 0
    );

    const totalCantidad = lotesFiltrados.reduce(
      (total, inv) => total + (Number(inv.cantidad) || 0),
      0
    );
    const totalSubCantidad = lotesFiltrados.reduce(
      (total, inv) => total + (Number(inv.subCantidad) || 0),
      0
    );
    const totalPeso = lotesFiltrados.reduce(
      (total, inv) => total + (Number(inv.peso) || 0),
      0
    );

    setLotesProducto(lotesFiltrados);
    setCantLimit(totalCantidad);
    setCantUnitLimit(totalSubCantidad);
    setPesoLimit(
      totalPeso === "NaN" ||
        !totalPeso
        ? 0
        : totalPeso
    );

    setCantidadPorCaja(
      lotesFiltrados[0]?.lote?.cantidadPorCaja
        ? lotesFiltrados[0]?.lote?.cantidadPorCaja
        : null
    );

    if (lotesFiltrados.length > 0) {
      const loteMasAntiguo = newValue?.inventarios?.reduce((prev, current) => {
        if (!prev) return current;
        if (!prev.lote || !current.lote) return prev;
        const prevDate = new Date(prev.lote.fecha_caducidad || "9999-12-31");
        const currentDate = new Date(current.lote.fecha_caducidad || "9999-12-31");
        return currentDate < prevDate ? current : prev;
      }, null);

      setProductosDetallados((prev) => [
        {
          productoId,
          newValue,
          lotesFiltrados,
          cantLimit: totalCantidad,
          cantUnitLimit: totalSubCantidad,
          pesoLimit:
            totalPeso === "NaN" ||
            !totalPeso
              ? 0
              : totalPeso,
          cantidadPorCaja: lotesFiltrados[0]?.lote?.cantidadPorCaja || null,
          loteMasAntiguo: loteMasAntiguo,
          peso: totalPeso > 0 ? 1 : null,
          cantidad:
            totalCantidad > 0 &&
            totalSubCantidad === 0
              ? 1
              : null,
          cantidadPorUnidad:
            (totalSubCantidad > 0 &&
              totalPeso <= 0) ||
            totalPeso === "NaN"
              ? 1
              : null,
          ventaData,
        },
        ...prev,
      ]);
      handleLoteChange(loteMasAntiguo?.lote?.id_lote || null, lotesFiltrados);
      setCantLote(loteMasAntiguo);
    }
  };

  const handleLoteChange = (loteId, lotesParam) => {
    setLote(loteId);
    const lotes = lotesParam || lotesProducto;
    const loteSeleccionado = lotes.find((lote) => {
      return (lote.lote?.id_lote || null) === (loteId || null);
    });

    setCantLote(loteSeleccionado);
    setVentaData((prev) => ({ ...prev, loteId }));
    setProductosDetallados((prev) =>
      prev.map((producto) =>
        producto.lotesFiltrados.some(
          (lote) => (lote.lote?.id_lote || null) === (loteId || null)
        )
          ? { ...producto, loteSeleccionado }
          : producto
      )
    );
  };

  const handleCancelar = () => {
    setProductosSeleccionados([]);
    setVentaData((prev) => ({
      ...prev,
      productoId: "",
      loteId: "",
    }));
    setLote("");
    setLotesProducto([]);
    setPeso("");
    setPrecio("");
    setCantidadPorUnidad("");
    setCantidad("");
    setCantLimit(0);
    setCantUnitLimit(0);
    setPesoLimit(0);
    setMetodosVenta(null);
    setcantidadMetodo(null);
    setMetodoSeleccionado(null);
    setProductosDetallados([]);
  };

  useEffect(() => {
    setCancelForm(() => handleCancelar);
  }, [setCancelForm]);

  const productosUnicos = [
    ...new Map(
      productos?.map((producto) => [producto.id_producto, producto])
    ).values(),
  ];

  const productosUnicosFiltrados = useMemo(
    () =>
      (productos || []).flatMap((producto) => {
        const mapaProveedores = new Map();
        (producto.inventarios || []).forEach((inv) => {
          const prov = inv.lote?.detalleCompra?.proveedor || null;
          const proveedorKey = prov?.id_proveedor || "sin-proveedor";
          mapaProveedores.set(proveedorKey, prov);
        });

        const data = Array.from(mapaProveedores.values()).map((proveedor) => {
          const inventariosDelProveedor = (producto.inventarios || []).filter(
            (inv) => {
              const proveedorInventario = inv.lote?.detalleCompra?.proveedor || null;
              return (
                (proveedorInventario?.id_proveedor || "sin-proveedor") ===
                (proveedor?.id_proveedor || "sin-proveedor")
              );
            }
          );
          const loteMasAntiguo = inventariosDelProveedor?.reduce(
            (prev, current) => {
              if (!prev?.lote || !current?.lote) return prev;
              const prevDate = new Date(prev.lote.fecha_caducidad || "9999-12-31");
              const currentDate = new Date(
                current.lote.fecha_caducidad || "9999-12-31"
              );
              return currentDate < prevDate ? current : prev;
            }
          );
          return {
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            codigo_barra: producto.codigo_barra,
            forma_farmaceutica: producto.forma_farmaceutica,
            concentracion: producto.concentracion,
            uso_res: producto.uso_res,
            proveedor,
            precio: producto.precio,
            inventarios: inventariosDelProveedor,
          };
        });
        return data;
      }),
    [productos]
  );

  return (
    <Box sx={{ padding: 2 }}>
      <form>
        <Grid container spacing={1} justifyContent="center">
          {lotesProducto.length > 0 && (
            <Grid item xs={12} sm={12} sx={{ display: "none" }}>
              <FormControl fullWidth>
                <InputLabel>Lote</InputLabel>
                <Select
                  value={ventaData.loteId || ""}
                  label="Lote"
                  onChange={(e) => handleLoteChange(e.target.value)}
                >
                  {lotesProducto.map((lote) => (
                    <MenuItem
                      key={lote?.lote?.id_lote}
                      value={lote?.lote?.id_lote}
                    >
                      {formatLapazDate(lote?.lote?.fecha_ingreso, "date")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </form>
      <ProductSelectedComponent
        productosSeleccionados={productosSeleccionados}
        removeProducto={removeProducto}
        setTotalPrice={setTotalPrice}
        productosDetallados={productosDetallados}
        setProductosDetallados={setProductosDetallados}
        handleCancelar={handleCancelar}
        clientes={clientes}
        ventaData={ventaData}
        setCliente={setCliente}
        handleOpenClientModal={handleOpenClientModal}
        productosUnicosFiltrados={productosUnicosFiltrados}
        handleProductoChange={handleProductoChange}
        setCantidad={setCantidad}
        setCantidadPorUnidad={setCantidadPorUnidad}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        movimientoInventario={movimientoInventario}
      />
    </Box>
  );
};

export default VentaForm;
