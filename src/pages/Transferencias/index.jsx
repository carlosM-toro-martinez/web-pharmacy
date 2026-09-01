import React from "react";
import DrawerComponent from "../../components/DrawerComponent";
import TransferenciasInventarioComponent from "../../components/TransferenciasInventarioComponent";
import { Box } from "@mui/material";

function Transferencias() {
  return (
    <DrawerComponent>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <TransferenciasInventarioComponent />
      </Box>
    </DrawerComponent>
  );
}

export default Transferencias;
