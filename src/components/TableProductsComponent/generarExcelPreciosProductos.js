import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoUrl from "../../assets/images/logos/3.png";
import { formatLapazDate } from "../../utils/dateUtils";

const NARANJA = "FFFF4500";
const NARANJA_CLARO = "FFFFE4D6";
const BLANCO = "FFFFFFFF";
const ROJO_CLARO = "FFFDE0E0";

const estiloMoneda = "#,##0.00";
const estiloNumero = "#,##0";

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

const estilizarFilaTotal = (row, color = NARANJA_CLARO) => {
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.border = {
      top: { style: "medium", color: { argb: NARANJA } },
      bottom: { style: "medium", color: { argb: NARANJA } },
    };
  });
};

const agregarHojaPrecios = (
  workbook,
  logoImageId,
  { nombreHoja, titulo, subtitulo, productos, totales }
) => {
  const hoja = workbook.addWorksheet(nombreHoja, {
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
    { key: "h", width: 16 },
    { key: "i", width: 13 },
    { key: "j", width: 16 },
    { key: "k", width: 20 },
    { key: "l", width: 20 },
    { key: "m", width: 20 },
  ];
  agregarEncabezado(hoja, logoImageId, titulo, subtitulo);

  const headerRow = hoja.addRow([
    "",
    "Producto",
    "Codigo de barra",
    "Forma farmaceutica",
    "Concentracion",
    "Precio de compra (Bs.)",
    "Precio de venta (Bs.)",
    "Utilidad (Bs.)",
    "Margen (%)",
    "Stock actual (unid.)",
    "Valor en costo (Bs.)",
    "Valor en venta (Bs.)",
    "Utilidad potencial (Bs.)",
  ]);
  hoja.mergeCells(`B${headerRow.number}:B${headerRow.number}`);
  estilizarEncabezadoTabla(headerRow);

  for (const producto of productos) {
    const row = hoja.addRow([
      "",
      producto.nombre || "N/A",
      producto.codigo_barra || "",
      producto.forma_farmaceutica || "",
      producto.concentracion || "",
      Number(producto.precioCompra),
      Number(producto.precioVenta),
      Number(producto.margen),
      producto.margenPorcentaje !== null && producto.margenPorcentaje !== undefined
        ? Number(producto.margenPorcentaje)
        : "",
      Number(producto.stockActual || 0),
      Number(producto.valorCosto),
      Number(producto.valorVenta),
      Number(producto.utilidadPotencial),
    ]);
    row.getCell(6).numFmt = estiloMoneda;
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).numFmt = estiloMoneda;
    row.getCell(7).alignment = { horizontal: "right" };
    row.getCell(8).numFmt = estiloMoneda;
    row.getCell(8).alignment = { horizontal: "right" };
    row.getCell(9).numFmt = "#,##0.00";
    row.getCell(9).alignment = { horizontal: "right" };
    row.getCell(10).numFmt = estiloNumero;
    row.getCell(10).alignment = { horizontal: "right" };
    row.getCell(11).numFmt = estiloMoneda;
    row.getCell(11).alignment = { horizontal: "right" };
    row.getCell(12).numFmt = estiloMoneda;
    row.getCell(12).alignment = { horizontal: "right" };
    row.getCell(13).numFmt = estiloMoneda;
    row.getCell(13).alignment = { horizontal: "right" };
    aplicarBordeFila(row);

    if (Number(producto.margen) < 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ROJO_CLARO },
        };
      });
    }
  }

  const totalRow = hoja.addRow([
    "",
    "TOTAL GENERAL",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    Number(totales.stockActual || 0),
    Number(totales.valorCosto || 0),
    Number(totales.valorVenta || 0),
    Number(totales.utilidadPotencial || 0),
  ]);
  totalRow.getCell(10).numFmt = estiloNumero;
  totalRow.getCell(10).alignment = { horizontal: "right" };
  totalRow.getCell(11).numFmt = estiloMoneda;
  totalRow.getCell(11).alignment = { horizontal: "right" };
  totalRow.getCell(12).numFmt = estiloMoneda;
  totalRow.getCell(12).alignment = { horizontal: "right" };
  totalRow.getCell(13).numFmt = estiloMoneda;
  totalRow.getCell(13).alignment = { horizontal: "right" };
  estilizarFilaTotal(totalRow);
};

const nombreHojaValido = (nombre) =>
  nombre.replace(/[*?:/\\[\]]/g, "").slice(0, 31) || "Sucursal";

export async function generarExcelPreciosProductos(
  reporte,
  { incluirPorSucursal = false } = {}
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Encuentra! Software Solutions";
  workbook.created = new Date();

  const logoBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoImageId = workbook.addImage({
    buffer: logoBuffer,
    extension: "png",
  });

  const generadoTexto = formatLapazDate(reporte.generadoEl || new Date(), "datetime");
  const notaExcluidos =
    "Solo productos con precio de compra y de venta registrados";

  agregarHojaPrecios(workbook, logoImageId, {
    nombreHoja: "Todas las sucursales",
    titulo: "Reporte de precios de productos",
    subtitulo: `Todas las sucursales  •  Generado el ${generadoTexto}  •  ${reporte.productos.length} producto(s)  •  ${notaExcluidos}`,
    productos: reporte.productos,
    totales: reporte.totales,
  });

  if (incluirPorSucursal) {
    for (const sucursal of reporte.sucursales || []) {
      agregarHojaPrecios(workbook, logoImageId, {
        nombreHoja: nombreHojaValido(sucursal.nombre),
        titulo: `Reporte de precios de productos - ${sucursal.nombre}`,
        subtitulo: `Sucursal ${sucursal.nombre}  •  Generado el ${generadoTexto}  •  ${sucursal.productos.length} producto(s)  •  ${notaExcluidos}`,
        productos: sucursal.productos,
        totales: sucursal.totales,
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "reporte-precios-productos.xlsx");
}

export default generarExcelPreciosProductos;
