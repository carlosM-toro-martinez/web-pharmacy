import React, { useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  TextField,
  FormControl,
  Box,
  Typography,
} from "@mui/material";
import createVirtualizedListbox from "./VirtualizedListbox";

const ProductoAutocompleteComponent = ({
  productosUnicosFiltrados,
  handleProductoChange,
  setCantidad,
  setCantidadPorUnidad,
  productosConTotales,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  // filterOptions deja aca, en cada busqueda, exactamente el arreglo que
  // se va a mostrar (mismo orden). El listbox virtualizado lo usa para
  // saber el texto real de la fila en cada posicion y calcularle su alto
  // (nombres/proveedores largos ocupan mas de una linea).
  const opcionesFiltradasRef = useRef([]);
  const ListboxComponent = useMemo(
    () =>
      createVirtualizedListbox((index) => {
        const opcion = opcionesFiltradasRef.current[index];
        if (!opcion) return "";
        const nombre = opcion.nombre || "";
        const forma = opcion?.forma_farmaceutica || "";
        const conc = opcion?.concentracion || "";
        const prov = opcion.proveedor?.nombre?.toUpperCase() || "";
        return `${nombre} ${forma} ${conc} "${prov}"`;
      }),
    []
  );

  // El texto por el que se busca (nombre + proveedor + codigo + forma +
  // concentracion) es siempre el mismo mientras no cambie la lista de
  // productos, asi que se arma UNA sola vez aqui en vez de reconstruirlo
  // por cada opcion en cada letra que se escribe (antes filterOptions
  // hacia ese trabajo de nuevo, para las ~2000 opciones, en cada tecla).
  // No cambia que campos se buscan ni el resultado, solo cuando se calcula.
  const opcionesBuscables = useMemo(
    () =>
      (productosConTotales || []).map((producto) => {
        const nombre = (producto?.nombre || "").toLowerCase();
        const combinado = [
          producto?.nombre,
          producto?.proveedor?.nombre,
          producto?.codigo_barra,
          producto?.forma_farmaceutica,
          producto?.concentracion,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return { ...producto, _nombreLower: nombre, _combinadoLower: combinado };
      }),
    [productosConTotales]
  );

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  // Guarda el ultimo codigo agregado por Enter y cuando, para no procesar
  // el mismo escaneo dos veces: algunos lectores de codigo de barras mandan
  // CR+LF como terminador, y el navegador entrega eso como dos eventos
  // "Enter" casi seguidos para la misma lectura.
  const ultimoEscaneoRef = useRef({ codigo: null, ts: 0 });

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const matchedProduct = productosUnicosFiltrados.find(
        (producto) =>
          producto.codigo_barra &&
          producto.codigo_barra.toLowerCase() === inputValue.toLowerCase()
      );

      if (matchedProduct) {
        // Autocomplete de MUI tiene su propio manejo de Enter en el <div>
        // que envuelve este input (selecciona la opcion resaltada si el
        // listbox esta abierto). Sin esto, un solo Enter puede terminar
        // agregando el producto dos veces: una vez aqui (por codigo de
        // barra) y otra al burbujear hasta el Autocomplete, que dispara su
        // propio onChange.
        event.preventDefault();
        event.stopPropagation();

        const ahora = Date.now();
        const esRepetido =
          ultimoEscaneoRef.current.codigo === matchedProduct.codigo_barra &&
          ahora - ultimoEscaneoRef.current.ts < 400;
        ultimoEscaneoRef.current = {
          codigo: matchedProduct.codigo_barra,
          ts: ahora,
        };
        if (esRepetido) return;

        handleProductoChange(matchedProduct.id_producto, matchedProduct);
        setCantidad();
        setCantidadPorUnidad();
        setInputValue("");
        setSelectedValue(null);
      }
    }
  };

  const [open, setOpen] = useState(false);

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          "& .MuiAutocomplete-input": {
            fontWeight: 500,
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f9f9f9",
            borderRadius: 1,
          },
          "& .MuiAutocomplete-endAdornment": {
            color: "#555",
          },
        }}
      >
        <Autocomplete
          options={opcionesBuscables}
          getOptionLabel={(producto) => {
            const nombre = producto?.nombre?.toUpperCase() || "";
            const prov = producto?.proveedor?.nombre?.toUpperCase() || "";
            const forma = producto?.forma_farmaceutica?.toUpperCase() || "";
            const conc = producto?.concentracion || "";
            const cod = producto?.codigo_barra || "";
            const stock = producto?.totalSubCantidad ?? 0;
            return `${nombre} ${forma} ${conc} - “${prov}” [${cod}] Stock: ${stock}u.`;
          }}
          value={selectedValue}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={(event, reason) => {
            if (reason === "blur") {
              setOpen(false);
            }
          }}
          onChange={(event, newValue) => {
            if (newValue) {
              handleProductoChange(newValue.id_producto, newValue);
            }
            // Al seleccionar una opcion, MUI Autocomplete reemplaza el texto
            // del campo por el label completo de la opcion elegida (su propio
            // comportamiento por defecto). Esto lo revierte a lo que la
            // persona realmente escribio ("search"), para que el campo se
            // quede con "nov" (no "NOVADOL FORTE...") y pueda seguir
            // buscando/eligiendo otro producto parecido sin escribir de nuevo.
            setInputValue(search);
            setSelectedValue(null);
            setTimeout(() => setOpen(true), 0);
          }}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          isOptionEqualToValue={(option, value) =>
            option?.id_producto === value?.id_producto
          }
          filterOptions={(options, { inputValue }) => {
            setSearch(inputValue);
            const query = inputValue.toLowerCase().trim();
            const searchWords = query.split(/\s+/).filter(Boolean);
            if (!searchWords.length) {
              opcionesFiltradasRef.current = options;
              return options;
            }

            const puntuar = (option) => {
              const nombre = option._nombreLower || "";
              const combined = option._combinadoLower || "";

              if (!searchWords.every((word) => combined.includes(word))) {
                return null;
              }
              // Prioriza coincidencias al inicio del nombre (ej. "pa" -> "PARACETAMOL")
              // por encima de coincidencias en medio de otra palabra.
              if (nombre.startsWith(query)) return 0;
              if (nombre.split(/\s+/).some((palabra) => palabra.startsWith(query))) {
                return 1;
              }
              if (nombre.includes(query)) return 2;
              return 3;
            };

            const resultado = options
              .map((option) => ({ option, puntaje: puntuar(option) }))
              .filter(({ puntaje }) => puntaje !== null)
              .sort((a, b) =>
                a.puntaje !== b.puntaje
                  ? a.puntaje - b.puntaje
                  : (a.option?.nombre || "").localeCompare(b.option?.nombre || "")
              )
              .map(({ option }) => option);

            opcionesFiltradasRef.current = resultado;
            return resultado;
          }}
          ListboxComponent={ListboxComponent}
          renderOption={(props, option) => {
            const nombre = option.nombre || "";
            const prov = option.proveedor?.nombre?.toUpperCase() || "";
            const stock = option.totalSubCantidad ?? 0;
            const forma = option?.forma_farmaceutica || "";
            const conc = option?.concentracion || "";
            const cod = option?.codigo_barra || "";
            const precio =
              option?.inventarios?.[0]?.lote?.precioVenta || option?.precio || "";

            return (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  py: 1,
                  px: 2,
                  "&:hover": { backgroundColor: "#f0f4ff" },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 510, color: "#000", textAlign: "center" }}
                >
                  {nombre} {forma} {conc}
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{ fontWeight: 500, color: "#000", ml: 0.5 }}
                  >
                    “{prov}”
                  </Typography>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: stock > 0 ? "green" : "red", mt: 0.3 }}
                >
                  Stock: {stock} u.
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: stock > 0 ? "green" : "red", mt: 0.3 }}
                >
                  Precio: {precio} Bs.
                </Typography>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Producto" onKeyDown={handleKeyDown} />
          )}
        />
      </Box>
    </FormControl>
  );
};

export default ProductoAutocompleteComponent;
