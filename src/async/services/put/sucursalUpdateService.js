import { put } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalUpdateService = async ({ id_sucursal, payload }) => {
  return await put(`${buildApiUri()}/v1/sucursales/${id_sucursal}`, payload);
};

export default sucursalUpdateService;
