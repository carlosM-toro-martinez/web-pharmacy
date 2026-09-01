import { get } from "../../api";
import buildApiUri from "../../utils/buildApiUri";

const buscarStockSucursalesService = async (q, excluirSucursal = null) => {
  const params = new URLSearchParams();
  params.set("q", q);
  if (excluirSucursal) params.set("excluir_sucursal", excluirSucursal);
  return await get(
    `${buildApiUri()}/v1/inventario/buscar-sucursales?${params.toString()}`
  );
};
export default buscarStockSucursalesService;
