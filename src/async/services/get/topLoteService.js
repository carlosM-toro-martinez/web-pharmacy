import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const topLoteService = async (idSucursal = null, dias = 90) => {
  const params = new URLSearchParams();
  if (idSucursal) params.set("id_sucursal", idSucursal);
  if (dias) params.set("dias", dias);
  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(`${buildApiUri()}/v1/lote/proximos_vencidos${query}`);
};
export default topLoteService;
