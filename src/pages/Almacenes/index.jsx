import React, { useState } from "react";
import { useQuery } from "react-query";
import DrawerComponent from "../../components/DrawerComponent";
import TableProductsComponent from "../../components/TableProductsComponent";
import { Box, Button, Typography } from "@mui/material";
import categoriasService from "../../async/services/get/categoriasService";
import productosService from "../../async/services/get/productosService";
import TableCategoriasComponent from "../../components/TableCategoriasComponent";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useNavigate } from "react-router-dom";
import proveedoresService from "../../async/services/get/proveedoresService";
import ProveedoresManagerModal from "../../components/ProveedoresManagerModal";

function Almacenes() {
  const navigate = useNavigate();
  const [openProveedores, setOpenProveedores] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(`sectionsProducts`, () =>
    productosService()
  );

  const {
    data: categorias,
    isLoading: isLoadingCategorias,
    isError,
    refetch: refetchCategoria,
  } = useQuery("categorias", categoriasService);

  const {
    data: proveedoresData,
    isLoading: isLoadingProveedores,
    error: errorProveedores,
    refetch: refetchProveedores,
  } = useQuery(`proveedores`, proveedoresService);

  const handleButtonClick = () => {
    navigate("/almacenes/crear");
  };

  return (
    <DrawerComponent>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          component={"h2"}
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            margin: "1rem 0 .5rem 0",
          }}
        >
          Inventario
        </Typography>
        <Box style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleButtonClick}
          >
            Crear Nueva Compra
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalShippingOutlinedIcon />}
            onClick={() => setOpenProveedores(true)}
          >
            Proveedores
          </Button>
        </Box>
        {!isLoading ? (
          Array.isArray(data) && data.length > 0 ? (
            <TableProductsComponent
              productos={data}
              refetchProducts={refetch}
              proveedoresData={(proveedoresData || []).filter((p) => p.activo !== false)}
            />
          ) : (
            <Typography variant="body1">
              Aún no existen productos registrados.
            </Typography>
          )
        ) : null}

        <Typography
          component={"h2"}
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            margin: "1rem 0 1.5rem 0",
          }}
        >
          Categorias
        </Typography>

        {!isLoadingCategorias ? (
          Array.isArray(categorias) && categorias.length > 0 ? (
            <TableCategoriasComponent
              categorias={categorias}
              refetchCategorias={refetchCategoria}
            />
          ) : (
            <Typography variant="body1">Aún no existen categorías.</Typography>
          )
        ) : null}

      </Box>

      <ProveedoresManagerModal
        open={openProveedores}
        handleClose={() => setOpenProveedores(false)}
        proveedores={proveedoresData}
        refetchProveedores={refetchProveedores}
      />
    </DrawerComponent>
  );
}

export default Almacenes;
