import React, { useState } from "react";
import DrawerComponent from "../../DrawerComponent";
import { useQuery } from "react-query";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import productosSimpleService from "../../../async/services/get/productosSimpleService";
import TableProductsComponent from "./TableProductsComponent";
import MostSoldProductsComponent from "./MostSoldProductsComponent";

function ReportProductosComponent() {
  const { data, isLoading } = useQuery(`sectionsProducts-simple`, () =>
    productosSimpleService({ limit: 3000 })
  );

  const [selectedView, setSelectedView] = useState("historial"); // o "masVendidos"

  return (
    <DrawerComponent>
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Reporte de Productos
        </Typography>

        <ButtonGroup variant="outlined" color="primary" sx={{ mb: 3 }}>
          <Button
            onClick={() => setSelectedView("masVendidos")}
            variant={selectedView === "masVendidos" ? "contained" : "outlined"}
          >
            Más vendidos
          </Button>
          <Button
            onClick={() => setSelectedView("historial")}
            variant={selectedView === "historial" ? "contained" : "outlined"}
          >
            Historial por producto
          </Button>
        </ButtonGroup>

        {!isLoading && selectedView === "historial" && (
          <TableProductsComponent products={data} />
        )}

        {selectedView === "masVendidos" && <MostSoldProductsComponent />}
      </Box>
    </DrawerComponent>
  );
}

export default ReportProductosComponent;
