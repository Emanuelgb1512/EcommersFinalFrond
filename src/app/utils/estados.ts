// Color de la etiqueta según el estado del pedido o del pago
export function claseEstado(estado: string | null | undefined): string {
  switch (estado) {
    case 'Pendiente': return 'b-amarillo';
    case 'En proceso':
    case 'Enviado': return 'b-azul';
    case 'Aprobado':
    case 'Pagado':
    case 'Entregado': return 'b-verde';
    case 'Rechazado': return 'b-rojo';
    case 'Reembolsar': return 'b-naranja';
    default: return 'b-gris';   // Cancelado y otros
  }
}

// En la tienda un pago "Aprobado" se muestra como "Pagado"
export function etiquetaPago(estado: string | null | undefined): string {
  if (!estado) return '—';
  return estado === 'Aprobado' ? 'Pagado' : estado;
}

// La API envía las fechas en UTC; esto las convierte a la hora local
export function aFecha(texto: string): Date {
  const tieneZona = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(texto);
  return new Date(tieneZona ? texto : texto + 'Z');
}