import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesRegistrosVaciosService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/registros-vacios`);
};

export default ajustesRegistrosVaciosService;
