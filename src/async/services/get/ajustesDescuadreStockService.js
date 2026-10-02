import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesDescuadreStockService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/descuadre-stock`);
};

export default ajustesDescuadreStockService;
