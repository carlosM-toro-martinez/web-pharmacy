import React, { useContext, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../../../context/MainContext";
import productosService from "../../../async/services/get/productosService";
import metodoVentasService from "../../../async/services/get/metodoVentasService.js";
import { useQuery } from "react-query";
import TableVentasReport from "../../../components/DashboardReporteComponent/ReportVentasComponent/TableVentasReport/index.jsx";
import ventasTodayService from "../../../async/services/get/ventasTodayService.js";
import empty from "../../../assets/images/empty.svg";
function SalesToday({
  reportVentas,
  isLoadingVentas,
  isErrorVentas,
  refetchVentas,
}) {
  const { data, user } = useContext(MainContext);

  //   const {
  //     data: reportVentas,
  //     isLoading: isLoadingVentas,
  //     isError: isErrorVentas,
  //     refetch: refetchVentas,
  //   } = useQuery("ventasToday", ventasTodayService);
  //   const { data: productos, isLoading: isLoadingProductos } = useQuery(
  //     "products",
  //     productosService
  //   );

  function ordenarPorIdVenta(arr) {
    return [...arr].sort((a, b) => a.id_venta - b.id_venta);
  }

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [ventasOrdenadas, setVentasOrdenadas] = useState([]);

  const { data: metodoVentasData, refetch } = useQuery(
    ["metodoVentas", selectedProductId],
    () => metodoVentasService(selectedProductId),
    {
      enabled: !!selectedProductId,
    }
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (reportVentas && Array.isArray(reportVentas)) {
      const ordenadas = ordenarPorIdVenta(reportVentas);
      setVentasOrdenadas(ordenadas);
    }
  }, [reportVentas]);

  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        {isLoadingVentas ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isErrorVentas ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <p>Error al cargar el reporte de ventas</p>
          </Box>
        ) : (
          <>
            <Typography
              component={"h2"}
              style={{
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "bold  ",
              }}
            >
              Ventas de hoy
            </Typography>
            {reportVentas &&
            Array.isArray(reportVentas) &&
            reportVentas.length > 0 ? (
              <TableVentasReport
                reportData={ventasOrdenadas}
                ventaToday={true}
                refetchVentas={refetchVentas}
                caja={data}
              />
            ) : (
              <img
                src={empty}
                alt="No hay datos"
                style={{
                  width: "10rem",
                  height: "auto",
                  display: "block",
                  margin: "auto",
                }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default SalesToday;
