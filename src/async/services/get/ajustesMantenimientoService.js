import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesMantenimientoService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/mantenimiento`);
};

export default ajustesMantenimientoService;
