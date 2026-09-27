import { put } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const proveedorUpdateService = async ({ id_proveedor, ...payload }) => {
  return await put(`${buildApiUri()}/v1/proveedores/${id_proveedor}`, payload);
};
export default proveedorUpdateService;
