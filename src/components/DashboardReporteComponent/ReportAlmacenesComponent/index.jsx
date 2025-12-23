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
import loteService from "../../../async/services/get/loteService.js";
import reportAlmacenesService from "../../../async/services/get/reportAlmacenesService.js";
import TableAlmacenesReport from "./TableAlmacenesReport";

function ReportAlmacenesComponent() {
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [fechasAgrupadas, setFechasAgrupadas] = useState([]);

  const { data: lotes, isLoading: isLoadingLotes } = useQuery(
    "loteData",
    loteService
  );

  const {
    data: reportData,
    refetch: fetchReport,
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery(
    ["reporteAlmacenes", selectedDateRange],
    () => {
      if (selectedDateRange) {
        return reportAlmacenesService(
          selectedDateRange.primerosId,
          selectedDateRange.ultimosId
        );
      }
    },
    {
      enabled: false,
    }
  );

  const handleDateRangeChange = (event) => {
    setSelectedDateRange(event.target.value);
  };

  const handleGenerateReport = () => {
    if (selectedDateRange) {
      console.log("Generating report for:", selectedDateRange);
      fetchReport();
    }
  };

  useEffect(() => {
    if (lotes) {
      const agrupadosPorFecha = lotes.reduce((acc, lote) => {
        const fechaIngreso = new Date(lote.fecha_ingreso).toLocaleDateString();
        if (!acc[fechaIngreso]) {
          acc[fechaIngreso] = {
            fecha: fechaIngreso,
            primerosId: lote.id_lote,
            ultimosId: lote.id_lote,
          };
        } else {
          acc[fechaIngreso].ultimosId = lote.id_lote;
        }
        return acc;
      }, {});

      const fechasTratadas = Object.values(agrupadosPorFecha);
      fechasTratadas.sort((a, b) => b.primerosId - a.primerosId);

      setFechasAgrupadas(fechasTratadas);
    }
  }, [lotes]);

  return (
    <DrawerComponent>
      {!isLoadingLotes ? (
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
            Reporte de compras
          </Typography>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              alignItems: "center",
              marginTop: "3rem",
              flexWrap: "wrap",
            }}
          >
            <FormControl style={{ width: "20rem" }}>
              <InputLabel id="select-fecha-label">Rango de Fechas</InputLabel>
              <Select
                label="Rango de Fechas"
                labelId="select-fecha-label"
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                renderValue={(selected) => selected?.fecha || ""}
              >
                {fechasAgrupadas?.map((fecha) => (
                  <MenuItem key={fecha.fecha} value={fecha}>
                    {fecha.fecha}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={!selectedDateRange}
              style={{ height: "56px" }}
            >
              Generar Reporte
            </Button>
          </Box>

          {/* {selectedDateRange && (
            <Typography
              style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "textSecondary",
              }}
            >
              IDs capturados: Inicio = {selectedDateRange.primerosId}, Fin ={" "}
              {selectedDateRange.ultimosId}
            </Typography>
          )} */}

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
            reportData && <TableAlmacenesReport reportData={reportData} />
          )}
        </Box>
      ) : (
        <Box>Cargando lotes...</Box>
      )}
    </DrawerComponent>
  );
}

export default ReportAlmacenesComponent;