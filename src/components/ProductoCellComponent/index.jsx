import React from "react";
import { Box, Typography } from "@mui/material";

// Celda estándar para mostrar un producto en tablas/reportes: nombre
// grande, y debajo (chiquito) concentración y forma farmacéutica para
// distinguir productos que comparten nombre pero no son iguales
// (ej. "TONICO INTI" en dos concentraciones distintas).
function ProductoCellComponent({ nombre, concentracion, forma_farmaceutica }) {
  const detalle = [concentracion, forma_farmaceutica]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {nombre || "-"}
      </Typography>
      {detalle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", lineHeight: 1.2 }}
        >
          {detalle}
        </Typography>
      )}
    </Box>
  );
}

export default ProductoCellComponent;
