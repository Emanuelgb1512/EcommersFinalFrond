import { HttpErrorResponse } from '@angular/common/http';

// Convierte cualquier error de la API en un texto para mostrar al usuario
export function mensajeError(err: unknown, defecto = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    const msg = err.error?.mensaje;
    if (typeof msg === 'string' && msg) return msg;
    if (err.status === 403) return 'No tienes permiso para hacer esto.';
  }
  return defecto;
}