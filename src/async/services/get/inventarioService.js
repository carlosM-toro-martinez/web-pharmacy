import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const inventarioService = async (idSucursal = null) => {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : "";
  return await get(`${buildApiUri()}/v1/inventario${query}`);
};
export default inventarioService;
