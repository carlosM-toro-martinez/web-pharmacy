import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesResumenService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/resumen`);
};

export default ajustesResumenService;
