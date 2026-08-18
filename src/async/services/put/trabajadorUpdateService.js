import { put } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const trabajadorUpdateService = async ({ id_trabajador, payload }) => {
  return await put(`${buildApiUri()}/v1/trabajadores/${id_trabajador}`, payload);
};

export default trabajadorUpdateService;
