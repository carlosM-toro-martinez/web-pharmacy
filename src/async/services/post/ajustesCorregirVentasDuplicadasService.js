import { post } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const ajustesCorregirVentasDuplicadasService = async (items = []) => {
  return await post(
    `${buildApiUri()}/v1/ajustes/ventas-duplicadas/corregir`,
    { items }
  );
};

export default ajustesCorregirVentasDuplicadasService;
