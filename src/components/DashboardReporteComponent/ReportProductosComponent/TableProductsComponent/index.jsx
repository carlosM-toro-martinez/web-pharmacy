import React, { useState } from "react";
import MyAutocomplete from "../../../MyAutocomplete";
import { Box, CircularProgress, MenuItem, TextField } from "@mui/material";
import productHistoryService from "../../../../async/services/get/productHistoryService";
import sucursalesService from "../../../../async/services/get/sucursalesService";
import { useQuery } from "react-query";
import HistoryProductComponent from "./HistoryProductComponent"; // Ajusta la ruta si es necesario

function TableProductsComponent({ products }) {
  const [producto, setProducto] = useState();
  const [productoName, setProductoName] = useState();
  const [idProduct, setIdProduct] = useState(null);
  const [idSucursal, setIdSucursal] = useState("");

  const { data: sucursales = [] } = useQuery("sucursales", sucursalesService);

  const {
    data: historyData,
    isLoading,
    isError,
    isSuccess,
  } = useQuery(
    ["product-history", idProduct, idSucursal],
    () => productHistoryService(idProduct, idSucursal),
    {
      enabled: !!idProduct,
    }
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 700,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <MyAutocomplete
            options={products}
            getOptionLabel={(opt) =>
              `${opt.nombre} ${opt.forma_farmaceutica ?? ""} ${
                opt.concentracion ?? ""
              }`
            }
            onChange={(opt) => {
              setProducto(opt ?? null);
              setProductoName(opt?.nombre ?? "");
              setIdProduct(opt?.id_producto ?? null);
            }}
            label="Producto"
            placeholder="Buscar producto..."
            disableClearable={true}
            productoName={productoName}
            producto={producto}
          />
        </Box>
        <TextField
          select
          label="Sucursal"
          value={idSucursal}
          onChange={(event) => setIdSucursal(event.target.value)}
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
      </Box>

      {isLoading && <CircularProgress sx={{ mt: 2 }} />}
      {isError && (
        <Box sx={{ mt: 2, color: "red" }}>Error al cargar historial</Box>
      )}
      {isSuccess && historyData && (
        <Box sx={{ width: "100%", mt: 3 }}>
          <HistoryProductComponent history={historyData} producto={producto} />
        </Box>
      )}
    </Box>
  );
}

export default TableProductsComponent;
