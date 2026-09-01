import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const productosService = async (idSucursal = null) => {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : "";
  return await get(`${buildApiUri()}/v1/productos${query}`);
};
export default productosService;
