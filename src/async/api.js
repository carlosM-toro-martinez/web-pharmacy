const getHeaders = () => {
  const token = localStorage.getItem("token");
  const sucursal = localStorage.getItem("sucursal");
  let parsedSucursal = null;
  try {
    parsedSucursal = sucursal && sucursal !== "null" ? JSON.parse(sucursal) : null;
  } catch {
    parsedSucursal = null;
  }
  const headers = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined" && window.location?.hostname) {
    headers["X-Frontend-Host"] = window.location.hostname;
  }
  if (token && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }
  if (parsedSucursal?.id_sucursal) {
    headers["X-Sucursal-Id"] = parsedSucursal.id_sucursal;
  }
  return headers;
};

const buildOptions = (payload, method, isFile) => {
  const options = {
    method,
    headers: isFile ? {} : getHeaders(),
  };
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    options["body"] = isFile ? payload : JSON.stringify(payload);
  }
  return options;
};

// Si el token ya caducó (o es invalido), el backend responde 401 en
// cualquier endpoint. Antes esto solo tiraba un Error que cada pantalla
// manejaba (o no) a su manera, asi que la pantalla se quedaba mostrando
// datos viejos en memoria como si la sesion siguiera activa — eso fue lo
// que paso con la venta sin sucursal: el cajero siguio vendiendo con la
// sesion vencida porque nada lo mando de vuelta al login. Se maneja aca,
// en el unico lugar por el que pasan todas las peticiones, para que
// cualquier 401 cierre la sesion y redirija sin depender de que cada
// componente lo detecte por su cuenta.
const manejarSesionExpirada = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("sucursal");
  localStorage.removeItem("superAdmin");
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const request = async (endpoint, payload, method, isFile) => {
  const options = buildOptions(payload, method, isFile);
  const response = await fetch(endpoint, options);
  if (response.ok) {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return error;
    }
  } else {
    if (response.status === 401) {
      manejarSesionExpirada();
    }
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body?.error || body?.message || message;
    } catch {
      // el cuerpo no era JSON, se usa el mensaje por defecto
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
};

export const post = async (endpoint, payload, isFile = false) =>
  request(endpoint, payload, "POST", isFile);

export const get = async (endpoint, payload, isFile = false) =>
  request(endpoint, payload, "GET", isFile);

export const put = async (endpoint, payload, isFile = false) =>
  request(endpoint, payload, "PUT", isFile);

export const remove = async (endpoint, payload, isFile = false) =>
  request(endpoint, payload, "DELETE", isFile);
