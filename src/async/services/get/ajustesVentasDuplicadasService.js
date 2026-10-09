import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesVentasDuplicadasService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.anio) params.set("anio", filters.anio);
  if (filters.id_sucursal) params.set("id_sucursal", filters.id_sucursal);
  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(`${buildApiUri()}/v1/ajustes/ventas-duplicadas${query}`);
};

export default ajustesVentasDuplicadasService;
