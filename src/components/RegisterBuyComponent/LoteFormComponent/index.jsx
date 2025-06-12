import React, { useEffect, useState } from "react";
import {
  Grid,
  InputAdornment,
  TextField,
  Box,
  Button,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

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
  const [selectedPercent, setSelectedPercent] = useState(30);
  const [errors, setErrors] = useState({
    lote: false,
    fechaCaducidad: false,
    loteExists: false,
    caducidadPasada: false,
  });

  useEffect(() => {
    const nuevoPrecio = precio * (1 + selectedPercent / 100);
    setPrecioVenta(Number(nuevoPrecio.toFixed(2)));
  }, [precio, selectedPercent]);

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

    // if (
    //   loteData?.some((item) => item.numero_lote === lote) &&
    //   !isLoteProveedorLocked
    // ) {
    //   newErrors.loteExists = true;
    //   hasErrors = true;
    // }

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
    console.log(errors.loteExists);
  };

  const porcentajes = Array.from(
    { length: (40 - 15) / 5 + 1 },
    (_, i) => 15 + i * 5
  );

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
          //helperText="Ej. 3 paq de cocacola"
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
          //helperText="Ej. 6 cocacolas por paq."
          //required
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
          //helperText="Ej. 60 Bs por paq."
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
          display: "flex",
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
        <FormControl size="small" sx={{ flexShrink: 0 }}>
          <InputLabel id="label-proveedor">%</InputLabel>
          <Select
            labelId="label-proveedor"
            label="%"
            //value={proveedor}
            value={selectedPercent}
            onChange={(e) => setSelectedPercent(e.target.value)}
          >
            {porcentajes.map((p) => (
              <MenuItem key={p} value={p}>
                {p}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* <Snackbar
        open={errors.loteExists}
        autoHideDuration={10000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={"error"}>Error el numero de lote ya existe</Alert>
      </Snackbar> */}
    </Box>
  );
};

export default LoteFormComponent;
