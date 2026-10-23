// Validación y limpieza de datos en bruto (Módulo 1)
function validarYLimpiarDatos(entrada) {
    let arrayBruto = [];

    if (typeof entrada === 'string') {
        // Soporta separación por comas, espacios o saltos de línea
        arrayBruto = entrada.split(/[\s,]+/).map(item => item.trim());
    } else if (Array.isArray(entrada)) {
        arrayBruto = entrada;
    }

    // Filtrar y convertir a números válidos
    const datosValidos = arrayBruto
        .map(val => Number(val))
        .filter(val => !isNaN(val) && val !== null);

    if (datosValidos.length === 0) {
        throw new Error("No se ingresaron datos numéricos válidos.");
    }

    return datosValidos;
}

module.exports = { validarYLimpiarDatos };