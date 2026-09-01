import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const inventarioService = async (idSucursal = null, options = {}) => {
  const params = new URLSearchParams();
  if (idSucursal) params.set("id_sucursal", idSucursal);
  if (options.transferencia) params.set("transferencia", "true");
  if (options.q) params.set("q", options.q);
  if (options.limit) params.set("limit", options.limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(`${buildApiUri()}/v1/inventario${query}`);
};
export default inventarioService;
