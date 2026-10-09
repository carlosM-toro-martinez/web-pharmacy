import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const reportVentasPorTrabajadorService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.id_sucursal) params.set("id_sucursal", filters.id_sucursal);
  if (filters.id_trabajador) params.set("id_trabajador", filters.id_trabajador);
  const query = params.toString();
  return await get(
    `${buildApiUri()}/v1/reportes/ventas-por-trabajador${query ? `?${query}` : ""}`
  );
};

export default reportVentasPorTrabajadorService;
