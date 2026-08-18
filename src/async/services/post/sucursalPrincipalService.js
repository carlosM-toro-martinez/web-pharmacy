import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalPrincipalService = async (idSucursal) => {
  return await post(`${buildApiUri()}/v1/sucursales/${idSucursal}/principal`);
};

export default sucursalPrincipalService;
