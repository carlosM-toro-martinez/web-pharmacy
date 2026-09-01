import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const transferenciasReporteService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.id_sucursal_origen) {
    params.set("id_sucursal_origen", filters.id_sucursal_origen);
  }
  if (filters.id_sucursal_destino) {
    params.set("id_sucursal_destino", filters.id_sucursal_destino);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(
    `${buildApiUri()}/v1/movimiento-inventario/transferencias/reporte${query}`
  );
};

export default transferenciasReporteService;
