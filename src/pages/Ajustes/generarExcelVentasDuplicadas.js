import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoUrl from "../../assets/images/logos/3.png";
import { formatLapazDate } from "../../utils/dateUtils";

const NARANJA = "FFFF4500";
const BLANCO = "FFFFFFFF";
const bordeFino = { style: "thin", color: { argb: "FFE0E0E0" } };

export async function generarExcelVentasDuplicadas(reporte, filtrosTexto = "") {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Encuentra! Software Solutions";
  workbook.created = new Date();

  const logoBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoImageId = workbook.addImage({ buffer: logoBuffer, extension: "png" });

  const ws = workbook.addWorksheet("Stock a revisar", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  ws.columns = [
    { key: "a", width: 6 },
    { key: "b", width: 34 },
    { key: "c", width: 14 },
    { key: "d", width: 18 },
    { key: "e", width: 16 },
    { key: "f", width: 20 },
    { key: "g", width: 22 },
    { key: "h", width: 16 },
    { key: "i", width: 16 },
    { key: "j", width: 16 },
    { key: "k", width: 20 },
  ];

  ws.addImage(logoImageId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 60, height: 60 } });
  ws.mergeCells("B1:K1");
  const titulo = ws.getCell("B1");
  titulo.value = "Productos con stock a revisar (ventas duplicadas)";
  titulo.font = { size: 15, bold: true };
  ws.mergeCells("B2:K2");
  const subtitulo = ws.getCell("B2");
  subtitulo.value = `Generado el ${formatLapazDate(new Date(), "datetime")}${
    filtrosTexto ? `  •  Filtros: ${filtrosTexto}` : ""
  }  •  ${reporte.totalProductosAfectados} producto(s)/sucursal con faltante real pendiente  •  ${reporte.totalUnidadesDescontadasDeMas} unidad(es) en total (ya descuenta otras salidas/compras posteriores)`;
  subtitulo.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  ws.getRow(1).height = 24;
  ws.getRow(2).height = 18;
  ws.getRow(3).height = 8;

  const headerRow = ws.addRow([
    "",
    "Producto",
    "Codigo",
    "Forma farmaceutica",
    "Concentracion",
    "Proveedor",
    "Sucursal",
    "Stock actual en sistema",
    "Faltante real pendiente",
    "Stock sugerido a verificar",
    "Ultima venta duplicada",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BLANCO } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NARANJA } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  for (const p of reporte.productos) {
    const row = ws.addRow([
      "",
      p.nombre,
      p.codigo_barra || "N/A",
      p.forma_farmaceutica || "N/A",
      p.concentracion || "N/A",
      p.proveedor || "N/A",
      p.sucursal,
      p.stockReal,
      p.faltanteReal,
      p.stockSugerido,
      formatLapazDate(p.fechaMasReciente, "date"),
    ]);
    row.getCell(8).alignment = { horizontal: "center" };
    row.getCell(9).alignment = { horizontal: "center" };
    row.getCell(9).font = { bold: true, color: { argb: "FFD32F2F" } };
    row.getCell(10).alignment = { horizontal: "center" };
    row.getCell(10).font = { bold: true };
    row.eachCell((cell) => {
      cell.border = { top: bordeFino, bottom: bordeFino, left: bordeFino, right: bordeFino };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `stock-a-revisar_${hoyISO()}.xlsx`);
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default generarExcelVentasDuplicadas;
