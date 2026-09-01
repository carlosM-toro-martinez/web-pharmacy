import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const cajaService = async (idSucursal = null) => {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : "";
  return await get(`${buildApiUri()}/v1/caja${query}`);
};
export default cajaService;
