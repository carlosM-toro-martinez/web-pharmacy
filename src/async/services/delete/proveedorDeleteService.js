import { remove } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

// Da de baja al proveedor (activo=false); no lo borra de verdad.
const proveedorDeleteService = async (id_proveedor) => {
  return await remove(`${buildApiUri()}/v1/proveedores/${id_proveedor}`);
};
export default proveedorDeleteService;
