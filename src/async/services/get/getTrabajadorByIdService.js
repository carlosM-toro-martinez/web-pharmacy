import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const getTrabajadorByIdService = async (id_trabajador) => {
  return await get(`${buildApiUri()}/v1/trabajadores/history/${id_trabajador}`);
};
export default getTrabajadorByIdService;
