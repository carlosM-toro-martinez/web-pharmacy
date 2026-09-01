import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const registroLoginService = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.exito !== "" && filters.exito !== undefined) {
    params.set("exito", filters.exito);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return await get(`${buildApiUri()}/v1/login/registro${query}`);
};

export default registroLoginService;
