import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function HistoryProductComponent({ history, producto }) {
  const { historial, stock } = history;

  const formatDate = (dateString) => {
    return format(new Date(dateString), "PPpp", { locale: es });
  };

  // El stock actual es el único saldo real que tenemos; para mostrar
  // "cantidad antes/después" por movimiento se reconstruye el saldo hacia
  // atrás en el tiempo (compra suma, venta y salida sin venta restan).
  // Nota: no incluye transferencias entre sucursales, así que el saldo
  // reconstruido puede no cuadrar si el producto se transfirió alguna vez.
  const historialConSaldo = useMemo(() => {
    let saldo = Number(stock?.subCantidad) || 0;
    const resultado = new Array(historial.length);
    for (let i = historial.length - 1; i >= 0; i--) {
      const item = historial[i];
      const movimiento = Number(item.detalle?.subCantidad) || 0;
      const esIngreso = item.tipo === "compra";
      const despues = saldo;
      const antes = esIngreso ? despues - movimiento : despues + movimiento;
      resultado[i] = {
        ...item,
        cantidadAntes: antes,
        cantidadDespues: despues,
        cantidadMovimiento: movimiento,
      };
      saldo = antes;
    }
    return resultado;
  }, [historial, stock]);

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ textTransform: "uppercase", fontWeight: "bold" }}
      >
        {[
          producto?.nombre,
          producto?.concentracion,
          producto?.forma_farmaceutica,
        ]
          .filter(Boolean)
          .join(" ")}

        {stock?.subCantidad > 0 ? (
          <Box component="span" sx={{ color: "green", ml: 1 }}>
            <strong>{`${stock.subCantidad} unidades actualmente en almacen`}</strong>
          </Box>
        ) : (
          <Box component="span" sx={{ color: "text.secondary", ml: 1 }}>
            <strong>Aún no hay stock para este producto</strong>
          </Box>
        )}
      </Typography>

      <Grid container spacing={2}>
        {historialConSaldo
          .filter((item) => item.detalle?.subCantidad > 0)
          .map((item, index) => {
            let color = "";
            let title = "";

            if (item.tipo === "compra") {
              color = "green";
              title = "COMPRA";
            } else if (item.tipo === "venta") {
              color = "red";
              title = "VENTA";
            } else if (item.tipo === "movimiento") {
              color = "#1976d2";
              title = item.tipo_movimiento?.toUpperCase() || "MOVIMIENTO";
            }

            const peso = Number(item.detalle?.peso) || 0;

            return (
              <Grid item xs={12} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeft: `6px solid ${color}`,
                    boxShadow: 2,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.01)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color={color}
                      fontWeight="bold"
                    >
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.fecha)}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {item.trabajador?.nombre && (
                      <Typography variant="body1">
                        <strong>Trabajador:</strong> {item.trabajador.nombre}
                      </Typography>
                    )}

                    {item.tipo === "compra" && (
                      <Typography variant="body1">
                        <strong>Proveedor:</strong> {item.proveedor?.nombre}
                      </Typography>
                    )}

                    {item.tipo === "venta" && (
                      <Typography variant="body1">
                        <strong>Cliente:</strong> {item.cliente?.nombre}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2">
                      <strong>Cantidad antes:</strong> {item.cantidadAntes}
                    </Typography>
                    <Typography variant="body2">
                      <strong>
                        {item.tipo === "compra" ? "Cantidad de entrada:" : "Cantidad de salida:"}
                      </strong>{" "}
                      {item.cantidadMovimiento}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cantidad después:</strong> {item.cantidadDespues}
                    </Typography>

                    {peso > 0 && (
                      <Typography variant="body2">
                        <strong>Peso:</strong> {peso}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
}

export default HistoryProductComponent;
