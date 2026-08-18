import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalTransferirService = async (payload) => {
  return await post(`${buildApiUri()}/v1/sucursales/transferir`, payload);
};

export default sucursalTransferirService;
