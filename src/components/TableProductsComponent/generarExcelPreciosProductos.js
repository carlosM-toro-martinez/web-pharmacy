import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoUrl from "../../assets/images/logos/3.png";
import { formatLapazDate } from "../../utils/dateUtils";

const NARANJA = "FFFF4500";
const BLANCO = "FFFFFFFF";

const estiloMoneda = "#,##0.00";

const agregarEncabezado = (worksheet, logoImageId, titulo, subtitulo) => {
  worksheet.addImage(logoImageId, {
    tl: { col: 0.15, row: 0.15 },
    ext: { width: 60, height: 60 },
  });

  worksheet.mergeCells("B1:F1");
  const tituloCell = worksheet.getCell("B1");
  tituloCell.value = titulo;
  tituloCell.font = { size: 16, bold: true, color: { argb: "FF1A1A1A" } };
  tituloCell.alignment = { vertical: "middle" };

  worksheet.mergeCells("B2:F2");
  const subtituloCell = worksheet.getCell("B2");
  subtituloCell.value = subtitulo;
  subtituloCell.font = { size: 10, color: { argb: "FF666666" }, italic: true };
  subtituloCell.alignment = { vertical: "middle" };

  worksheet.getRow(1).height = 26;
  worksheet.getRow(2).height = 18;
  worksheet.getRow(3).height = 8;
};

const estilizarEncabezadoTabla = (row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BLANCO } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: NARANJA },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCCCCCC" } },
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });
};

const bordeFilaFina = { style: "thin", color: { argb: "FFE0E0E0" } };
const aplicarBordeFila = (row) => {
  row.eachCell((cell) => {
    cell.border = {
      top: bordeFilaFina,
      bottom: bordeFilaFina,
      left: bordeFilaFina,
      right: bordeFilaFina,
    };
  });
};

export async function generarExcelPreciosProductos(reporte) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Encuentra! Software Solutions";
  workbook.created = new Date();

  const logoBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoImageId = workbook.addImage({
    buffer: logoBuffer,
    extension: "png",
  });

  const subtitulo = `Todas las sucursales  •  Generado el ${formatLapazDate(
    reporte.generadoEl || new Date(),
    "datetime"
  )}  •  ${reporte.productos.length} producto(s)`;

  const hoja = workbook.addWorksheet("Precios de productos", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  hoja.columns = [
    { key: "a", width: 4 },
    { key: "b", width: 36 },
    { key: "c", width: 18 },
    { key: "d", width: 22 },
    { key: "e", width: 18 },
    { key: "f", width: 20 },
    { key: "g", width: 20 },
  ];
  agregarEncabezado(
    hoja,
    logoImageId,
    "Reporte de precios de productos",
    subtitulo
  );

  const headerRow = hoja.addRow([
    "",
    "Producto",
    "Codigo de barra",
    "Forma farmaceutica",
    "Concentracion",
    "Precio de compra (Bs.)",
    "Precio de venta (Bs.)",
  ]);
  hoja.mergeCells(`B${headerRow.number}:B${headerRow.number}`);
  estilizarEncabezadoTabla(headerRow);

  for (const producto of reporte.productos) {
    const row = hoja.addRow([
      "",
      producto.nombre || "N/A",
      producto.codigo_barra || "",
      producto.forma_farmaceutica || "",
      producto.concentracion || "",
      producto.precioCompra !== null ? Number(producto.precioCompra) : "",
      producto.precioVenta !== null ? Number(producto.precioVenta) : "",
    ]);
    row.getCell(6).numFmt = estiloMoneda;
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).numFmt = estiloMoneda;
    row.getCell(7).alignment = { horizontal: "right" };
    aplicarBordeFila(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "reporte-precios-productos.xlsx");
}

export default generarExcelPreciosProductos;
