import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const sucursalesService = async () => {
  return await get(`${buildApiUri()}/v1/sucursales`);
};

export default sucursalesService;
