import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, TextField, Box, Button } from "@mui/material";

const LoteFormComponent = ({
  lote,
  setLote,
  fechaCaducidad,
  setFechaCaducidad,
  cantidad,
  setCantidad,
  precio,
  setPrecio,
  loteData,
  setError,
  isLoteProveedorLocked,
  subCantidad,
  setSubCantidad,
  precioVenta,
  setPrecioVenta,
}) => {
  const [errors, setErrors] = useState({
    lote: false,
    fechaCaducidad: false,
    loteExists: false,
    caducidadPasada: false,
  });

  useEffect(() => {
    validateForm();
  }, [lote, fechaCaducidad]);

  const validateForm = () => {
    let newErrors = {
      lote: false,
      fechaCaducidad: false,
      loteExists: false,
      caducidadPasada: false,
    };

    let hasErrors = false;

    if (
      loteData?.some((item) => item.numero_lote === lote) &&
      !isLoteProveedorLocked
    ) {
      newErrors.loteExists = true;
      hasErrors = true;
    }

    if (!lote && !isLoteProveedorLocked) {
      newErrors.lote = true;
      hasErrors = true;
    }

    if (!fechaCaducidad) {
      newErrors.fechaCaducidad = true;
      hasErrors = true;
    } else {
      const today = new Date();
      const selectedDate = new Date(fechaCaducidad);
      if (selectedDate < today.setHours(0, 0, 0, 0)) {
        newErrors.caducidadPasada = true;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    setError(hasErrors);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
        p: 2,
      }}
    >
      <Box
        sx={{
          flexBasis: { xs: "100%", sm: "50%", md: "33.33%", lg: "15%" },
          minWidth: 250,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Paquetes o cajas"
          type="number"
          value={cantidad || ""}
          onChange={(e) => setCantidad(e.target.value)}
          helperText="Ej. 3 paq de cocacola"
          required
          fullWidth
        />
      </Box>

      <Box
        sx={{
          flexBasis: { xs: "100%", sm: "50%", md: "33.33%", lg: "15%" },
          minWidth: 250,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Cantidad por paquete"
          type="number"
          value={subCantidad || ""}
          onChange={(e) => setSubCantidad(e.target.value)}
          helperText="Ej. 6 cocacolas por paq."
          required
          fullWidth
        />
      </Box>

      <Box
        sx={{
          flexBasis: { xs: "100%", sm: "50%", md: "33.33%", lg: "15%" },
          minWidth: 250,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Precio por caja"
          type="number"
          value={precio || ""}
          onChange={(e) => setPrecio(e.target.value)}
          helperText="Ej. 60 Bs por paq."
          InputProps={{
            endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
          }}
          fullWidth
        />
      </Box>

      <Box
        sx={{
          flexBasis: { xs: "100%", sm: "50%", md: "33.33%", lg: "15%" },
          minWidth: 250,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Precio de venta"
          type="number"
          value={precioVenta || ""}
          onChange={(e) => setPrecioVenta(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
          }}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default LoteFormComponent;
