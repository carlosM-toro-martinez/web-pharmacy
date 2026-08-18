import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalAddService = async (payload) => {
  return await post(`${buildApiUri()}/v1/sucursales`, payload);
};

export default sucursalAddService;
