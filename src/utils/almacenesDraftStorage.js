const DRAFT_KEY = "almacenes_crear_draft";

export const loadAlmacenesDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAlmacenesDraft = (draft) => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // almacenamiento no disponible (modo privado, etc.), se ignora
  }
};

export const clearAlmacenesDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignorar
  }
};
