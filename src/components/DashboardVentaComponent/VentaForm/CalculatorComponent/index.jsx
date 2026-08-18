import React, { useState } from "react";
import { TextField, Typography, Box, Paper } from "@mui/material";
import useStyles from "./calculator.styles";

function CalculatorComponent({ totalPrice }) {
  const classes = useStyles();
  const [amountGiven, setAmountGiven] = useState("");
  const total = Number(totalPrice) || 0;
  const change = parseFloat(amountGiven) - total;

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountGiven(value);
    }
  };

  return (
    <Paper className={classes.container} elevation={3}>
      <Typography
        variant="h5"
        className={classes.title}
        sx={{ fontWeight: "bold", marginBottom: "1rem" }}
      >
        Calculadora de Cambio
      </Typography>

      <Box className={classes.row}>
        <Typography className={classes.label}>Total a pagar:</Typography>
        <Typography className={classes.value}>Bs {total.toFixed(2)}</Typography>
      </Box>

      <Box className={classes.row}>
        <Typography className={classes.label}>Dinero recibido:</Typography>
        <TextField
          type="text"
          inputProps={{ inputMode: "decimal" }}
          value={amountGiven}
          onChange={handleInputChange}
          placeholder="Ej. 100.00"
          variant="outlined"
          size="small"
          className={classes.input}
        />
      </Box>

      <Box className={classes.row}>
        <Typography className={classes.label}>Cambio:</Typography>
        <Typography
          className={classes.value}
          style={{ color: amountGiven && change < 0 ? "red" : "#2ecc71" }}
        >
          {amountGiven
            ? `Bs ${change >= 0 ? change.toFixed(2) : "Monto insuficiente"}`
            : "—"}
        </Typography>
      </Box>
    </Paper>
  );
}

export default CalculatorComponent;
