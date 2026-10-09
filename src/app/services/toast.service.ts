import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  toasts = signal<Toast[]>([]);

  exito(mensaje: string) { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string) { this.mostrar(mensaje, 'error'); }
  info(mensaje: string) { this.mostrar(mensaje, 'info'); }

  cerrar(id: number) {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }

  private mostrar(mensaje: string, tipo: Toast['tipo']) {
    const id = ++this.contador;
    this.toasts.update(lista => [...lista, { id, mensaje, tipo }]);
    setTimeout(() => this.cerrar(id), 4000);
  }
}