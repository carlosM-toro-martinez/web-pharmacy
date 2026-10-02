import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesLotesSobrevendidosService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/lotes-sobrevendidos`);
};

export default ajustesLotesSobrevendidosService;
