import React, {
  forwardRef,
  useContext,
  createContext,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { VariableSizeList } from "react-window";

// El listbox por defecto de MUI Autocomplete monta un <li> real en el DOM
// por CADA opcion que pasa el filtro, sin importar cuantas sean ni cuantas
// quepan visibles en pantalla. Con pocas coincidencias no se nota, pero con
// una busqueda corta (ej. 2 letras) pueden ser cientos, y crear cientos de
// filas de golpe es lo que se siente como "se traba".
//
// Este componente reemplaza esa lista por una "virtualizada": solo existen
// en el DOM las filas realmente visibles (mas un pequeño colchon), y a
// medida que se hace scroll se van reciclando esos mismos elementos en vez
// de crear nuevos. No cambia que opciones aparecen, en que orden, ni como
// se ve cada fila (renderOption de Autocomplete sigue siendo el mismo) -
// solo cambia cuantos nodos reales llega a tener la pagina a la vez.
//
// Cada fila puede necesitar mas o menos alto segun que tan largo sea el
// nombre+proveedor del producto (con nombres largos el texto hace "wrap" a
// 2 o mas lineas), asi que la altura NO es fija: se mide el texto real con
// un canvas (usa la fuente real del navegador de quien este usando el
// sistema en ese momento) para calcular cuantas lineas va a ocupar, con un
// margen de seguridad para nunca cortar contenido.

const LISTBOX_PADDING = 8; // padding de .MuiAutocomplete-listbox (tema por defecto de MUI)
const ROW_PADDING_Y = 16; // renderOption: sx py:1 -> 8px arriba + 8px abajo
const ROW_PADDING_X = 32; // renderOption: sx px:2 -> 16px a cada lado
const BODY1_LINE_HEIGHT = 24; // Typography body1 por defecto: 1rem, line-height 1.5
const CAPTION_LINE_HEIGHT = 20; // Typography caption por defecto: 0.75rem, line-height 1.66
const CAPTION_MARGIN_TOP = 2.4; // sx mt:0.3 de cada caption (0.3 * 8px)
const MARGEN_SEGURIDAD = 1.08; // 8% extra sobre el ancho medido, para no cortar por redondeo
const MIN_ROW_HEIGHT =
  ROW_PADDING_Y + BODY1_LINE_HEIGHT + (CAPTION_LINE_HEIGHT + CAPTION_MARGIN_TOP) * 2;

let canvasMedicion = null;
function medirAnchoTexto(texto, font) {
  if (typeof document === "undefined") return 0;
  if (!canvasMedicion) canvasMedicion = document.createElement("canvas");
  const ctx = canvasMedicion.getContext("2d");
  ctx.font = font;
  return ctx.measureText(texto || "").width;
}

function calcularAlturaFila(textoPrincipal, anchoDisponible) {
  if (!anchoDisponible || anchoDisponible <= 0) return MIN_ROW_HEIGHT;
  const anchoTexto = medirAnchoTexto(
    textoPrincipal,
    "510 16px Roboto, Helvetica, Arial, sans-serif"
  );
  const lineas = Math.max(1, Math.ceil((anchoTexto * MARGEN_SEGURIDAD) / anchoDisponible));
  return (
    ROW_PADDING_Y +
    lineas * BODY1_LINE_HEIGHT +
    (CAPTION_LINE_HEIGHT + CAPTION_MARGIN_TOP) * 2
  );
}

const OuterElementContext = createContext({});
const OuterElementType = forwardRef(function OuterElementType(props, ref) {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function renderRow({ data, index, style }) {
  const item = data[index];
  return React.cloneElement(item, {
    style: { ...style, top: style.top + LISTBOX_PADDING },
  });
}

// Alto visible del desplegable. El listbox por defecto de MUI Autocomplete
// usa max-height: 40vh (limita el alto y deja scroll); esto reproduce lo
// mismo con un valor fijo razonable en vez de depender del viewport, para
// que el calculo de virtualizacion sea simple y predecible.
const ALTO_VISIBLE_LISTA = 400;

// `obtenerTextoOpcion(index)` debe devolver el mismo texto que arma
// renderOption para la primera linea (nombre + forma + concentracion +
// proveedor), asi la altura calculada corresponde a la fila real.
const createVirtualizedListbox = (obtenerTextoOpcion) =>
  forwardRef(function VirtualizedListbox(props, ref) {
    const { children, ...other } = props;
    const itemData = Array.isArray(children) ? children : [children];
    const itemCount = itemData.length;

    const containerRef = useRef(null);
    const listRef = useRef(null);
    const [anchoDisponible, setAnchoDisponible] = useState(0);

    useEffect(() => {
      const el = containerRef.current;
      if (!el || typeof ResizeObserver === "undefined") return undefined;
      const observer = new ResizeObserver((entries) => {
        const ancho = entries[0]?.contentRect?.width;
        if (ancho) setAnchoDisponible(ancho - ROW_PADDING_X);
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const getItemSize = useMemo(
      () => (index) => {
        const texto = obtenerTextoOpcion(index);
        if (!texto) return MIN_ROW_HEIGHT;
        return calcularAlturaFila(texto, anchoDisponible);
      },
      [anchoDisponible]
    );

    useEffect(() => {
      listRef.current?.resetAfterIndex(0, true);
    }, [itemData, anchoDisponible]);

    const alturaVisible =
      Math.min(itemCount * MIN_ROW_HEIGHT, ALTO_VISIBLE_LISTA) + 2 * LISTBOX_PADDING;

    return (
      <div ref={containerRef}>
        <div ref={ref}>
          <OuterElementContext.Provider value={other}>
            <VariableSizeList
              ref={listRef}
              itemData={itemData}
              itemCount={itemCount}
              height={alturaVisible}
              width="100%"
              itemSize={getItemSize}
              estimatedItemSize={MIN_ROW_HEIGHT}
              overscanCount={5}
              outerElementType={OuterElementType}
              innerElementType="ul"
            >
              {renderRow}
            </VariableSizeList>
          </OuterElementContext.Provider>
        </div>
      </div>
    );
  });

export default createVirtualizedListbox;
