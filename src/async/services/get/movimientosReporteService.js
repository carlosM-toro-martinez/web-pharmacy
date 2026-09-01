import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const movimientosReporteService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.id_sucursal) params.set("id_sucursal", filters.id_sucursal);

  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(
    `${buildApiUri()}/v1/movimiento-inventario/reporte/movimientos${query}`
  );
};

export default movimientosReporteService;
