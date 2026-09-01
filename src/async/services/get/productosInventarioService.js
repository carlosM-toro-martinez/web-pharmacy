import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const productosInventarioService = async (idProduct, idSucursal = null) => {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : "";
  return await get(
    `${buildApiUri()}/v1/productos/${idProduct}/inventarios${query}`
  );
};
export default productosInventarioService;
