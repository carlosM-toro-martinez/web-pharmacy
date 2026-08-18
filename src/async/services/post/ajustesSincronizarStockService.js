import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesSincronizarStockService = async () => {
  return await post(`${buildApiUri()}/v1/ajustes/sincronizar-stock`);
};

export default ajustesSincronizarStockService;
