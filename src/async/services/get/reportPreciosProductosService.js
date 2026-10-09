import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const reportPreciosProductosService = async () => {
  return await get(`${buildApiUri()}/v1/reportes/precios-productos`);
};

export default reportPreciosProductosService;
