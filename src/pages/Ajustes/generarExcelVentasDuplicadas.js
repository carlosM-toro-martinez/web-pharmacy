import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoUrl from "../../assets/images/logos/3.png";
import { formatLapazDate } from "../../utils/dateUtils";

const NARANJA = "FFFF4500";
const BLANCO = "FFFFFFFF";
const bordeFino = { style: "thin", color: { argb: "FFE0E0E0" } };

export async function generarExcelVentasDuplicadas(reporte) {
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
    { key: "d", width: 22 },
    { key: "e", width: 16 },
    { key: "f", width: 16 },
    { key: "g", width: 16 },
    { key: "h", width: 20 },
  ];

  ws.addImage(logoImageId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 60, height: 60 } });
  ws.mergeCells("B1:H1");
  const titulo = ws.getCell("B1");
  titulo.value = "Productos con stock a revisar (ventas duplicadas)";
  titulo.font = { size: 15, bold: true };
  ws.mergeCells("B2:H2");
  const subtitulo = ws.getCell("B2");
  subtitulo.value = `Generado el ${formatLapazDate(new Date(), "datetime")}  •  ${reporte.totalProductosAfectados} producto(s)/sucursal con posible descuadre  •  ${reporte.totalUnidadesDescontadasDeMas} unidad(es) descontada(s) de mas en total`;
  subtitulo.font = { size: 10, italic: true, color: { argb: "FF666666" } };
  ws.getRow(1).height = 24;
  ws.getRow(2).height = 18;
  ws.getRow(3).height = 8;

  const headerRow = ws.addRow([
    "",
    "Producto",
    "Codigo",
    "Sucursal",
    "Stock actual en sistema",
    "Unidades descontadas de mas",
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
      p.sucursal,
      p.stockReal,
      p.unidadesDescontadasDeMas,
      p.stockSugerido,
      formatLapazDate(p.fechaMasReciente, "date"),
    ]);
    row.getCell(5).alignment = { horizontal: "center" };
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(6).font = { bold: true, color: { argb: "FFD32F2F" } };
    row.getCell(7).alignment = { horizontal: "center" };
    row.getCell(7).font = { bold: true };
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
