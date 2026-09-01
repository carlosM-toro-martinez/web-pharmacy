import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const reportAlmacenesService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.id_sucursal) params.set("id_sucursal", filters.id_sucursal);
  if (filters.numero_factura)
    params.set("numero_factura", filters.numero_factura);

  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(`${buildApiUri()}/v1/reportes/compras${query}`);
};
export default reportAlmacenesService;
