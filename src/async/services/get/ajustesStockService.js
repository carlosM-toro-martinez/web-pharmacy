import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesStockService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/auditoria-stock`);
};

export default ajustesStockService;
