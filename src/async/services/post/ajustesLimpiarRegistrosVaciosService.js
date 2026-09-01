import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesLimpiarRegistrosVaciosService = async () => {
  return await post(`${buildApiUri()}/v1/ajustes/limpiar-registros-vacios`);
};

export default ajustesLimpiarRegistrosVaciosService;
