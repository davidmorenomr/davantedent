// Clase que representa una cita de la clínica
class Cita {
  constructor({ id, dia, mes, anio, hora, minuto, nombre, apellidos,
                dni, telefono, nacimiento, observaciones }) {
    this.id = id ?? Date.now(); // instante de grabación = identificador único
    this.dia = dia;
    this.mes = mes;
    this.anio = anio;
    this.hora = hora;
    this.minuto = minuto;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.dni = dni;
    this.telefono = telefono;
    this.nacimiento = nacimiento;
    this.observaciones = observaciones;
  }

  // Fecha lista para mostrar: 05/12/2026 09:30
  get fechaTexto() {
    const p = n => String(n).padStart(2, "0");
    return `${p(this.dia)}/${p(this.mes)}/${this.anio} ${p(this.hora)}:${p(this.minuto)}`;
  }
}