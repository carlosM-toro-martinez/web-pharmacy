import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const stockInicialService = async (payload) => {
  return await post(`${buildApiUri()}/v1/sucursales/stock-inicial`, payload);
};

export default stockInicialService;
