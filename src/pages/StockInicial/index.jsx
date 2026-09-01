import React from "react";
import DrawerComponent from "../../components/DrawerComponent";
import StockInicialComponent from "../../components/StockInicialComponent";
import { Box } from "@mui/material";

function StockInicial() {
  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <StockInicialComponent />
      </Box>
    </DrawerComponent>
  );
}

export default StockInicial;
