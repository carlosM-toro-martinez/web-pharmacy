import { put } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const changePasswordService = async ({ oldPassword, newPassword }) => {
  return await put(`${buildApiUri()}/v1/login/change-password`, {
    oldPassword,
    newPassword,
  });
};

export default changePasswordService;
