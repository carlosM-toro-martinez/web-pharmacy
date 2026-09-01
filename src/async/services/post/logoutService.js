import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const logoutService = async () => {
  return await post(`${buildApiUri()}/v1/login/logout`, {});
};

export default logoutService;
