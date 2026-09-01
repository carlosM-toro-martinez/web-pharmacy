/**
 * Utilities para manejar fechas en zona horaria La Paz, Bolivia (UTC-4)
 * Estas funciones normalizan todas las fechas de la aplicación
 */

/**
 * Obtiene la fecha actual en zona horaria La Paz
 * Nota: Usa Date nativa + conversión a string para compatibilidad
 * @returns {object} Objeto con las propiedades de fecha/hora
 */
export const getLapazNow = () => {
  const now = new Date();
  const lapazTime = now.toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const [date, time] = lapazTime.split(", ");
  const [day, month, year] = date.split("/");

  return {
    iso: `${year}-${month}-${day}T${time}`,
    locale: lapazTime,
    date: new Date(`${year}-${month}-${day}T${time}`),
    formatted: `${day}/${month}/${year} ${time}`,
  };
};

/**
 * Formatea una fecha a zona horaria La Paz
 * @param {Date|string} dateInput - Fecha a formatear
 * @param {string} format - Formato deseado ('datetime' | 'date' | 'time')
 * @returns {string} Fecha formateada
 */
export const formatLapazDate = (dateInput, format = "datetime") => {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const options = {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  if (format === "date") {
    options.hour = undefined;
    options.minute = undefined;
    options.second = undefined;
  } else if (format === "time") {
    options.year = undefined;
    options.month = undefined;
    options.day = undefined;
  }

  const lapazString = date.toLocaleString("es-BO", options);

  if (format === "date") {
    return lapazString;
  } else if (format === "time") {
    return lapazString;
  }

  return lapazString;
};

/**
 * Obtiene el inicio del día actual en La Paz
 * @returns {string} Fecha del inicio del día
 */
export const getStartOfDayLapaz = () => {
  const { iso } = getLapazNow();
  return iso.split("T")[0] + "T00:00:00";
};

/**
 * Obtiene el fin del día actual en La Paz
 * @returns {string} Fecha del fin del día
 */
export const getEndOfDayLapaz = () => {
  const { iso } = getLapazNow();
  return iso.split("T")[0] + "T23:59:59";
};

/**
 * Compara si dos fechas son del mismo día en La Paz
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {boolean} True si son del mismo día
 */
export const isSameDayLapaz = (date1, date2) => {
  const format1 = formatLapazDate(date1, "date");
  const format2 = formatLapazDate(date2, "date");
  return format1 === format2;
};
