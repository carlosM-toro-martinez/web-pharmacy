import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesSincronizarProductoService = async (idProducto) => {
  return await post(`${buildApiUri()}/v1/ajustes/sincronizar-stock/${idProducto}`);
};

export default ajustesSincronizarProductoService;
