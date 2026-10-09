import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoUrl from "../../../assets/images/logos/3.png";
import { formatLapazDate } from "../../../utils/dateUtils";

const NARANJA = "FFFF4500";
const NARANJA_CLARO = "FFFFE4D6";
const GRIS_CLARO = "FFF5F5F5";
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

const formatearRango = (desde, hasta) => {
  if (!desde && !hasta) return "Todas las fechas";
  const d = desde ? formatLapazDate(desde, "date") : "inicio";
  const h = hasta ? formatLapazDate(hasta, "date") : "hoy";
  return `Del ${d} al ${h}`;
};

export async function generarExcelVentasPorTrabajador(reporte) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Encuentra! Software Solutions";
  workbook.created = new Date();

  const logoBuffer = await fetch(logoUrl).then((r) => r.arrayBuffer());
  const logoImageId = workbook.addImage({
    buffer: logoBuffer,
    extension: "png",
  });

  const subtitulo = `${formatearRango(reporte.desde, reporte.hasta)}  •  Generado el ${formatLapazDate(
    new Date(),
    "datetime"
  )}  •  ${reporte.cantidadVentasTotal} venta(s) en total`;

  // ---------- Hoja Resumen ----------
  const resumen = workbook.addWorksheet("Resumen", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  resumen.columns = [
    { key: "a", width: 8 },
    { key: "b", width: 34 },
    { key: "c", width: 20 },
    { key: "d", width: 20 },
    { key: "e", width: 20 },
    { key: "f", width: 20 },
  ];
  agregarEncabezado(resumen, logoImageId, "Reporte de ventas por trabajador", subtitulo);

  const headerRowResumen = resumen.addRow(["", "Trabajador", "Cantidad de ventas", "Total vendido (Bs.)"]);
  resumen.mergeCells(`B${headerRowResumen.number}:B${headerRowResumen.number}`);
  estilizarEncabezadoTabla(headerRowResumen);

  for (const trabajador of reporte.trabajadores) {
    const row = resumen.addRow([
      "",
      trabajador.nombre,
      trabajador.ventas.length,
      trabajador.totalVendido,
    ]);
    row.getCell(3).alignment = { horizontal: "center" };
    row.getCell(4).numFmt = estiloMoneda;
    row.getCell(4).alignment = { horizontal: "right" };
    aplicarBordeFila(row);
  }

  const totalRowResumen = resumen.addRow([
    "",
    "TOTAL GENERAL",
    reporte.cantidadVentasTotal,
    reporte.granTotal,
  ]);
  totalRowResumen.getCell(3).alignment = { horizontal: "center" };
  totalRowResumen.getCell(4).numFmt = estiloMoneda;
  totalRowResumen.getCell(4).alignment = { horizontal: "right" };
  estilizarFilaTotal(totalRowResumen);

  // ---------- Hoja Detalle (producto por producto, no venta por venta) ----------
  const detalle = workbook.addWorksheet("Detalle de ventas", {
    views: [{ state: "frozen", ySplit: 5 }],
  });
  detalle.columns = [
    { key: "a", width: 4 },
    { key: "b", width: 30 },
    { key: "c", width: 18 },
    { key: "d", width: 34 },
    { key: "e", width: 18 },
    { key: "f", width: 12 },
    { key: "g", width: 18 },
  ];
  agregarEncabezado(detalle, logoImageId, "Detalle de ventas por trabajador", subtitulo);

  const headerRowDetalle = detalle.addRow([
    "",
    "Trabajador",
    "Fecha",
    "Producto",
    "Precio de venta (Bs.)",
    "Cantidad",
    "Subtotal (Bs.)",
  ]);
  detalle.mergeCells(`B${headerRowDetalle.number}:B${headerRowDetalle.number}`);
  estilizarEncabezadoTabla(headerRowDetalle);

  for (const trabajador of reporte.trabajadores) {
    for (const venta of trabajador.ventas) {
      const productos =
        venta.productos && venta.productos.length
          ? venta.productos
          : [
              {
                nombre: "(venta sin detalle de productos)",
                precio_unitario: venta.total,
                cantidad: 1,
                subtotal: venta.total,
              },
            ];

      for (const producto of productos) {
        const row = detalle.addRow([
          "",
          trabajador.nombre,
          formatLapazDate(venta.fecha_venta, "datetime"),
          producto.nombre,
          producto.precio_unitario,
          producto.cantidad,
          producto.subtotal,
        ]);
        row.getCell(5).numFmt = estiloMoneda;
        row.getCell(5).alignment = { horizontal: "right" };
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).numFmt = estiloMoneda;
        row.getCell(7).alignment = { horizontal: "right" };
        aplicarBordeFila(row);
      }
    }

    const subtotalRow = detalle.addRow([
      "",
      `Subtotal ${trabajador.nombre}`,
      "",
      "",
      "",
      `${trabajador.ventas.length} venta(s)`,
      trabajador.totalVendido,
    ]);
    subtotalRow.getCell(7).numFmt = estiloMoneda;
    subtotalRow.getCell(7).alignment = { horizontal: "right" };
    estilizarFilaTotal(subtotalRow, GRIS_CLARO);
  }

  const totalRowDetalle = detalle.addRow([
    "",
    "TOTAL GENERAL",
    "",
    "",
    "",
    `${reporte.cantidadVentasTotal} venta(s)`,
    reporte.granTotal,
  ]);
  totalRowDetalle.getCell(7).numFmt = estiloMoneda;
  totalRowDetalle.getCell(7).alignment = { horizontal: "right" };
  estilizarFilaTotal(totalRowDetalle);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const nombreArchivo = `reporte-ventas-trabajadores_${(reporte.desde || "inicio")}_a_${
    reporte.hasta || "hoy"
  }.xlsx`;
  saveAs(blob, nombreArchivo);
}

export default generarExcelVentasPorTrabajador;
