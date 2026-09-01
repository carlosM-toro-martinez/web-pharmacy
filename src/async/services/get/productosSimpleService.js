import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const productosSimpleService = async (options = {}) => {
  const params = new URLSearchParams();
  params.set("simple", "true");
  if (options.q) params.set("q", options.q);
  if (options.limit) params.set("limit", options.limit);
  return await get(`${buildApiUri()}/v1/productos?${params.toString()}`);
};

export default productosSimpleService;
