// Almacenamiento de las citas en una cookie del navegador
const NOMBRE_COOKIE = "citas";
const LIMITE_COOKIE = 3800; // las cookies admiten unos 4 KB

// Devuelve true si se ha guardado y false si no cabe en la cookie
function guardarCitas(citas) {
  const valor = encodeURIComponent(JSON.stringify(citas));
  if (NOMBRE_COOKIE.length + valor.length > LIMITE_COOKIE) {
    return false;
  }
  document.cookie = `${NOMBRE_COOKIE}=${valor}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
  return true;
}

// Lee la cookie y devuelve un array de objetos Cita
function cargarCitas() {
  const par = document.cookie.split("; ").find(c => c.startsWith(NOMBRE_COOKIE + "="));
  if (!par) return [];
  try {
    const datos = JSON.parse(decodeURIComponent(par.split("=")[1]));
    return datos.map(d => new Cita(d));
  } catch {
    return [];
  }
}