import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const buyAddService = async (payload) => {
  return await post(`${buildApiUri()}/v1/productos/buy`, {
    requestId:
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    items: payload,
  });
};
export default buyAddService;
