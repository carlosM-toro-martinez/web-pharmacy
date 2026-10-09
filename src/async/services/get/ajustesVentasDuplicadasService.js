import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesVentasDuplicadasService = async () => {
  return await get(`${buildApiUri()}/v1/ajustes/ventas-duplicadas`);
};

export default ajustesVentasDuplicadasService;
