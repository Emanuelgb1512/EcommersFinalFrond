import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { Carrito, CarritoItem } from '../models/carrito.model';
import { Producto } from '../models/producto.model';
import { Usuario } from '../models/usuario.model';
import { mensajeError } from '../utils/errores';

const CLAVE_INVITADO = 'sz_carrito_invitado';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private api = `${environment.apiUrl}/Carrito`;

  items = signal<CarritoItem[]>([]);
  cantidadTotal = computed(() => this.items().reduce((s, i) => s + i.cantidad, 0));
  subtotal = computed(() => this.items().reduce((s, i) => s + i.precioUnitario * i.cantidad, 0));
  iva = computed(() => Math.round(this.subtotal() * environment.iva));
  total = computed(() => this.subtotal() + this.iva());

  constructor() {
    // Reacciona cuando el usuario inicia o cierra sesión (o al recargar la página)
    effect(() => {
      const usuario = this.auth.usuario();
      untracked(() => this.alCambiarUsuario(usuario));
    });
  }

  // ===== Acciones públicas =====
  agregar(producto: Producto, cantidad = 1): void {
    if (producto.stock <= 0) {
      this.toast.error('Este producto está agotado.');
      return;
    }

    if (this.auth.estaLogueado()) {
      this.http.post<Carrito>(`${this.api}/Agregar`, { productoId: producto.id, cantidad }).subscribe({
        next: c => { this.items.set(c.items); this.toast.exito('Agregado al carrito.'); },
        error: e => this.toast.error(mensajeError(e, 'No se pudo agregar al carrito.'))
      });
      return;
    }

    // Invitado: se guarda en el navegador
    const lista = [...this.items()];
    const existente = lista.find(i => i.productoId === producto.id);
    const nueva = (existente?.cantidad ?? 0) + cantidad;

    if (nueva > producto.stock) {
      this.toast.error(`Solo quedan ${producto.stock} unidades disponibles.`);
      return;
    }

    if (existente) {
      existente.cantidad = nueva;
      existente.subtotal = existente.precioUnitario * nueva;
    } else {
      lista.push({
        productoId: producto.id,
        nombre: producto.nombre,
        imagenUrl: producto.imagenUrl,
        precioUnitario: producto.precio,
        cantidad,
        stock: producto.stock,
        activo: producto.activo,
        subtotal: producto.precio * cantidad
      });
    }
    this.guardarInvitado(lista);
    this.toast.exito('Agregado al carrito.');
  }

  cambiarCantidad(productoId: number, cantidad: number): void {
    if (cantidad < 1) {
      this.quitar(productoId);
      return;
    }

    if (this.auth.estaLogueado()) {
      this.http.put<Carrito>(`${this.api}/Cantidad/${productoId}`, { cantidad }).subscribe({
        next: c => this.items.set(c.items),
        error: e => this.toast.error(mensajeError(e, 'No se pudo actualizar la cantidad.'))
      });
      return;
    }

    const lista = this.items().map(i => ({ ...i }));
    const item = lista.find(i => i.productoId === productoId);
    if (!item) return;
    if (cantidad > item.stock) {
      this.toast.error(`Solo quedan ${item.stock} unidades disponibles.`);
      return;
    }
    item.cantidad = cantidad;
    item.subtotal = item.precioUnitario * cantidad;
    this.guardarInvitado(lista);
  }

  quitar(productoId: number): void {
    if (this.auth.estaLogueado()) {
      this.http.delete<Carrito>(`${this.api}/Quitar/${productoId}`).subscribe({
        next: c => this.items.set(c.items),
        error: e => this.toast.error(mensajeError(e, 'No se pudo quitar el producto.'))
      });
      return;
    }
    this.guardarInvitado(this.items().filter(i => i.productoId !== productoId));
  }

  // Se usa después de una compra: el servidor ya vació el carrito
  recargar(): void {
    if (this.auth.estaLogueado()) this.cargarServidor();
  }

  // ===== Internos =====
  private alCambiarUsuario(usuario: Usuario | null): void {
    if (!usuario) {
      this.items.set(this.leerInvitado());
      return;
    }

    const invitado = this.leerInvitado();
    if (invitado.length === 0) {
      this.cargarServidor();
      return;
    }

    // Une el carrito del navegador con el de la cuenta
    const cuerpo = invitado.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }));
    this.http.post<Carrito>(`${this.api}/Sincronizar`, cuerpo).subscribe({
      next: c => {
        this.items.set(c.items);
        this.limpiarInvitado();
        this.toast.info('Tu carrito se guardó en tu cuenta.');
      },
      error: () => this.cargarServidor()
    });
  }

  private cargarServidor(): void {
    this.http.get<Carrito>(this.api).subscribe({
      next: c => this.items.set(c.items),
      error: () => this.items.set([])
    });
  }

  private guardarInvitado(lista: CarritoItem[]): void {
    this.items.set(lista);
    try { localStorage.setItem(CLAVE_INVITADO, JSON.stringify(lista)); } catch { }
  }

  private leerInvitado(): CarritoItem[] {
    try {
      const texto = localStorage.getItem(CLAVE_INVITADO);
      return texto ? JSON.parse(texto) as CarritoItem[] : [];
    } catch {
      return [];
    }
  }

  private limpiarInvitado(): void {
    try { localStorage.removeItem(CLAVE_INVITADO); } catch { }
  }
}