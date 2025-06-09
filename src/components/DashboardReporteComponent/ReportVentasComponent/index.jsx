import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import {
  MenuItem,
  Select,
  Button,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import DrawerComponent from "../../DrawerComponent";
import ventasService from "../../../async/services/get/ventasService.js";
import reportVentasService from "../../../async/services/get/reportVentasService.js";
import TableVentasReport from "./TableVentasReport";

function ReportVentasComponent() {
  const [idInicio, setIdInicio] = useState(null);
  const [idFinal, setIdFinal] = useState(null);
  const [fechasAgrupadas, setFechasAgrupadas] = useState([]);

  const { data: ventas, isLoading: isLoadingVentas } = useQuery(
    "ventas",
    ventasService
  );

  const {
    data: reportData,
    refetch: fetchReport,
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(
    ["reporteVentas", idInicio, idFinal],
    () => reportVentasService(idInicio, idFinal),
    {
      enabled: false,
    }
  );

  const handleInicioChange = (event) => {
    setIdInicio(event.target.value);
  };

  const handleFinalChange = (event) => {
    setIdFinal(event.target.value);
  };

  const handleGenerateReport = () => {
    if (idInicio && idFinal) {
      fetchReport();
    }
  };

  useEffect(() => {
    if (ventas) {
      const agrupadosPorFecha = ventas.reduce((acc, venta) => {
        const fechaVenta = new Date(venta.fecha_venta).toLocaleDateString();
        if (!acc[fechaVenta]) {
          acc[fechaVenta] = {
            fecha: fechaVenta,
            primerosId: venta.id_venta,
            ultimosId: venta.id_venta,
          };
        } else {
          acc[fechaVenta].ultimosId = venta.id_venta;
        }
        return acc;
      }, {});

      const fechasTratadas = Object.values(agrupadosPorFecha);

      setFechasAgrupadas(fechasTratadas);
    }
  }, [ventas]);

  return (
    <DrawerComponent>
      {!isLoadingVentas ? (
        <Box>
          <Typography
            component={"h2"}
            style={{
              textAlign: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              margin: "1rem 0 0 0",
            }}
          >
            Reporte de ventas
          </Typography>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "5rem",
              alignItems: "center",
              marginTop: "3rem",
            }}
          >
            <FormControl style={{ width: "15rem" }}>
              <InputLabel id="select-inicio-label">Fecha de Inicio</InputLabel>
              <Select
                label="Fecha de Inicio"
                labelId="select-inicio-label"
                value={idInicio}
                onChange={handleInicioChange}
              >
                {fechasAgrupadas?.map((fecha) => (
                  <MenuItem key={fecha.fecha} value={fecha.primerosId}>
                    {fecha.fecha}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={!idInicio || !idFinal}
            >
              Generar Reporte
            </Button>

            <FormControl style={{ width: "15rem" }}>
              <InputLabel id="select-final-label">Fecha Final</InputLabel>
              <Select
                label="Fecha Final"
                labelId="select-final-label"
                value={idFinal}
                onChange={handleFinalChange}
              >
                {fechasAgrupadas?.map((fecha) => (
                  <MenuItem key={fecha.fecha} value={fecha.ultimosId}>
                    {fecha.fecha}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {isLoadingReport ? (
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            reportData && <TableVentasReport reportData={reportData} />
          )}
        </Box>
      ) : (
        <Box>Cargando ventas...</Box>
      )}
    </DrawerComponent>
  );
}

export default ReportVentasComponent;
