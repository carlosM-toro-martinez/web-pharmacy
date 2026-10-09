import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesUtilidadesProductosService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/utilidades-productos`);
};

export default ajustesUtilidadesProductosService;
