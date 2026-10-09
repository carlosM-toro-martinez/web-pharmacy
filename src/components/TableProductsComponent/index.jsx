import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import EnhancedTableHead from "./EnhancedTableHead";
import ModalUpdateProduct from "./ModalUpdateProduct";
import ModalViewProduct from "./ModalViewProduct";
import useStyles from "./table.styles";
import productoDeleteServices from "../../async/services/delete/productoDeleteServices";
import { useMutation } from "react-query";
import detalleCompraUpdateServices from "../../async/services/put/detalleCompraUpdateServices";
import detalleCompraDeleteServices from "../../async/services/delete/detalleCompraDeleteServices";
import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import ProductoModalComponent from "../RegisterBuyComponent/ProductoModalComponent";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useContext } from "react";
import { MainContext } from "../../context/MainContext";
import CircularProgress from "@mui/material/CircularProgress";
import reportPreciosProductosService from "../../async/services/get/reportPreciosProductosService";
import generarExcelPreciosProductos from "./generarExcelPreciosProductos";

const ITEM_HEIGHT = 48;

export default function TableProductsComponent({
  productos,
  refetchProducts,
  proveedoresData,
}) {
  const classes = useStyles();
  const { sucursal } = useContext(MainContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedidProducto, setSelectedIdProduct] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  const [openProductoModal, setOpenProductoModal] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [generandoExcelPrecios, setGenerandoExcelPrecios] = useState(false);
  const [incluirHojasPorSucursal, setIncluirHojasPorSucursal] = useState(false);

  const handleOpenProductoModal = () => setOpenProductoModal(true);
  const handleCloseProductoModal = () => setOpenProductoModal(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleMissingOnly = () => {
    setShowMissingOnly((prev) => !prev);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredProducts = productos
    .filter((producto) => producto.activo !== false)
    .filter((producto) =>
      producto.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!showMissingOnly) return 0;
      const aVal = a.subCantidad ?? Infinity;
      const bVal = b.subCantidad ?? Infinity;
      return aVal - bVal;
    });

  const visibleRows = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenUpdateModal = () => {
    handleCloseMenu();
    setOpenUpdateModal(true);
  };

  const handleOpenViewModal = () => {
    handleCloseMenu();
    setOpenViewModal(true);
  };

  const handleCloseModals = () => {
    setOpenUpdateModal(false);
    setOpenViewModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = () => {
    deleteProductMutation.mutate(selectedidProducto);
    handleCloseMenu();
  };

  const deleteProductMutation = useMutation(productoDeleteServices, {
    onSuccess: () => {
      refetchProducts();
    },
    onError: (error) => {
      console.error("Error dando de baja producto:", error);
    },
  });

  const { mutate } = useMutation(
    ({ id, idProducto, updatedPrice, updatedSalePrice, idLote, idProveedor }) =>
      detalleCompraUpdateServices(id, {
        ...(updatedPrice !== undefined && { precio_unitario: updatedPrice }),
        ...(updatedSalePrice !== undefined && {
          precioVenta: updatedSalePrice,
        }),
        ...(idLote && { id_lote: idLote }),
        ...(idProveedor && { id_proveedor: idProveedor }),
        ...(idProducto && { id_producto: idProducto }),
      }),
    {
      onSuccess: () => {
        handleCloseModals();
        console.log("Detalle de compra actualizado exitosamente");
      },
      onError: (error) => {
        console.error(
          "Error al actualizar el detalle de compra:",
          error.message
        );
      },
    }
  );

  const {
    mutate: mutateDelete,
    isLoading: loading,
    isError,
  } = useMutation(
    async ({ dataDelete, idDetalle }) => {
      return await detalleCompraDeleteServices(idDetalle, dataDelete);
    },
    {
      onSuccess: (response) => {
        console.log("Mutación exitosa:", response);
        refetchProducts();
        handleCloseModals();
      },
      onError: (error) => {
        console.error("Error en la mutación:", error);
      },
    }
  );

  const handleExportToExcel = () => {
    const sortedProducts = [...filteredProducts].sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "", "es", {
        sensitivity: "base",
      })
    );

    const dataToExport = sortedProducts.map((row) => ({
      Nombre: row.nombre || "N/A",
      Stock: row.subCantidad ?? "",
      "Forma Farmacéutica": row.forma_farmaceutica || "",
      Concentración: row.concentracion || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "productos.xlsx");
  };

  const handleExportPreciosToExcel = async () => {
    setGenerandoExcelPrecios(true);
    try {
      const reporte = await reportPreciosProductosService();
      await generarExcelPreciosProductos(reporte, {
        incluirPorSucursal: incluirHojasPorSucursal,
      });
    } catch (error) {
      console.error("Error al generar el reporte de precios:", error);
    } finally {
      setGenerandoExcelPrecios(false);
    }
  };

  return (
    <Box className={classes.root}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: 2,
        }}
      >
        <Button
          variant="contained"
          color={showMissingOnly ? "secondary" : "primary"}
          onClick={toggleMissingOnly}
          sx={{ minWidth: 250, height: 56 }}
        >
          {showMissingOnly ? "Ver todos los productos" : "Ordenar por cantidad"}
        </Button>
      </Box>
      <Button
        onClick={handleOpenProductoModal}
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      ></Button>
      <ProductoModalComponent
        refetchProducts={refetchProducts}
        open={openProductoModal}
        handleClose={handleCloseProductoModal}
      />
      <Paper className={classes.paper}>
        <Box sx={{ padding: 2 }}>
          <TextField
            label="Buscar producto"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Box>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size="medium">
            <EnhancedTableHead />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isEvenRow = index % 2 === 0;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id_producto}
                    className={isEvenRow ? classes.evenRow : classes.oddRow}
                  >
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                    >
                      {row.nombre || "N/A"}
                    </TableCell>
                    <TableCell align="left">
                      {row.codigo_barra || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: row.stock > 0 ? "green" : "red",
                      }}
                    >
                      {row.subCantidad === row.stock
                        ? row.stock
                        : row.subCantidad ?? "N/A"}
                    </TableCell>

                    <TableCell align="left">
                      {row.forma_farmaceutica || "N/A"}
                    </TableCell>
                    <TableCell align="left">
                      {row.concentracion || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: row.uso_res ? "green" : "red",
                          textTransform: "uppercase",
                          color: "white",
                          fontWeight: "bold",
                          width: "3rem",
                          p: 1,
                          borderRadius: "1rem",
                          textAlign: "center",
                        }}
                      >
                        {row.uso_res ? "si" : "no"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-haspopup="true"
                        onClick={(e) => {
                          handleClick(e);
                          setSelectedProduct(row);
                          setSelectedIdProduct(row.id_producto);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseMenu}
                        PaperProps={{
                          style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: "20ch",
                          },
                        }}
                      >
                        <MenuItem onClick={() => handleOpenUpdateModal()}>
                          <EditIcon /> Editar
                        </MenuItem>
                        <MenuItem onClick={() => handleOpenViewModal()}>
                          <VisibilityIcon /> Ver
                        </MenuItem>
                        <MenuItem onClick={handleDeleteProduct}>
                          <DeleteIcon color="error" /> Dar de baja
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </Paper>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Button variant="outlined" color="success" onClick={handleExportToExcel}>
          Descargar Excel
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={handleExportPreciosToExcel}
          disabled={generandoExcelPrecios}
          startIcon={
            generandoExcelPrecios ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          {generandoExcelPrecios
            ? "Generando..."
            : "Excel: precios de compra y venta (todas las sucursales)"}
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={incluirHojasPorSucursal}
              onChange={(e) => setIncluirHojasPorSucursal(e.target.checked)}
            />
          }
          label="Agregar una hoja por cada sucursal"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        El Excel de precios siempre excluye los productos sin precio de
        compra o sin precio de venta registrado.
      </Typography>

      {openUpdateModal && (
        <ModalUpdateProduct
          product={selectedProduct}
          handleClose={handleCloseModals}
          refetchProducts={refetchProducts}
        />
      )}
      {openViewModal && (
        <ModalViewProduct
          product={selectedProduct}
          handleClose={handleCloseModals}
          editingRow={editingRow}
          setEditingRow={setEditingRow}
          editedPrice={editedPrice}
          setEditedPrice={setEditedPrice}
          mutate={mutate}
          mutateDelete={mutateDelete}
          proveedoresData={proveedoresData}
          idSucursal={sucursal?.id_sucursal}
        />
      )}
    </Box>
  );
}

TableProductsComponent.propTypes = {
  productos: PropTypes.array.isRequired,
};
