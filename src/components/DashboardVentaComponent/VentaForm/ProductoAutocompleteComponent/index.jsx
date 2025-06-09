import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  FormControl,
  Box,
  Typography,
} from "@mui/material";

const ProductoAutocompleteComponent = ({
  productosUnicosFiltrados,
  handleProductoChange,
  setCantidad,
  setCantidadPorUnidad,
  productosConTotales,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const matchedProduct = productosUnicosFiltrados.find(
        (producto) =>
          producto.codigo_barra &&
          producto.codigo_barra.toLowerCase() === inputValue.toLowerCase()
      );

      if (matchedProduct) {
        handleProductoChange(matchedProduct.id_producto, matchedProduct);
        setCantidad();
        setCantidadPorUnidad();
        setInputValue("");
        setSelectedValue(null);
      }
    }
  };

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          "& .MuiAutocomplete-input": {
            fontWeight: 500,
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f9f9f9",
            borderRadius: 1,
          },
          "& .MuiAutocomplete-endAdornment": {
            color: "#555",
          },
        }}
      >
        <Autocomplete
          options={productosConTotales || []}
          // 1) getOptionLabel solo devuelve el texto “plano” que MUI usará para filtrar/mostar en el input
          getOptionLabel={(producto) => {
            const nombre = producto?.nombre?.toUpperCase() || "";
            const prov = producto?.proveedor?.nombre?.toUpperCase() || "";
            return `${nombre} "${prov}" Stock. ${producto?.totalSubCantidad}u.`;
          }}
          value={selectedValue}
          onChange={(event, newValue) => {
            if (newValue) {
              handleProductoChange(newValue.id_producto, newValue);
              // setCantidad(); setCantidadPorUnidad(); si las necesitas
            }
            setInputValue("");
            setSelectedValue(null);
          }}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          isOptionEqualToValue={(option, value) =>
            option?.id_producto === value?.id_producto
          }
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.nombre
                  .toLowerCase()
                  .includes(inputValue.toLowerCase()) ||
                option.codigo_barra
                  ?.toLowerCase()
                  .includes(inputValue.toLowerCase())
            )
          }
          renderOption={(props, option) => {
            const nombre = option.nombre || "";
            const prov = option.proveedor?.nombre?.toUpperCase() || "";
            const stock = option.totalSubCantidad ?? 0;
            const forma_farmaceutica = option?.forma_farmaceutica || "";
            const concentracion = option?.concentracion || "";

            return (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#f0f4ff" },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "510", color: "#000" }}
                >
                  {nombre} {forma_farmaceutica} {concentracion}{" "}
                  {prov && (
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ fontWeight: 500, color: "#000", ml: 0.5 }}
                    >
                      “{prov}”
                    </Typography>
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: stock > 0 ? "green" : "red", mt: 0.3 }}
                >
                  Stock: {stock} u.
                </Typography>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Producto" onKeyDown={handleKeyDown} />
          )}
        />
      </Box>
    </FormControl>
  );
};

export default ProductoAutocompleteComponent;
