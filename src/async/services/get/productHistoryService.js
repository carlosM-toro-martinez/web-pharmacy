import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const productHistoryService = async (id_product, id_sucursal) => {
  const params = new URLSearchParams();
  if (id_sucursal) params.set("id_sucursal", id_sucursal);
  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(
    `${buildApiUri()}/v1/reportes/producto/${id_product}/historial${query}`
  );
};
export default productHistoryService;
