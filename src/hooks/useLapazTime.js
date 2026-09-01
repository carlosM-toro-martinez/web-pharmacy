import { useState, useEffect } from "react";
import { getLapazNow, formatLapazDate } from "../utils/dateUtils";

/**
 * Hook que mantiene sincronizada la hora/fecha de La Paz en tiempo real
 * Actualiza cada segundo para mostrar la hora actual
 * @returns {object} Objeto con fecha/hora actual en La Paz
 */
export const useLapazTime = () => {
  const [time, setTime] = useState(() => getLapazNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getLapazNow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
};

/**
 * Hook para obtener fecha formateada de La Paz
 * @param {Date|string} dateInput - Fecha a formatear
 * @param {string} format - Formato deseado
 * @returns {string} Fecha formateada
 */
export const useFormattedLapazDate = (dateInput, format = "datetime") => {
  return formatLapazDate(dateInput, format);
};
