import { remove } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalDeleteService = async (id_sucursal) => {
  return await remove(`${buildApiUri()}/v1/sucursales/${id_sucursal}`);
};
export default sucursalDeleteService;
