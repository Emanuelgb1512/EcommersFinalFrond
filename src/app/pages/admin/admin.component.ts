import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ToastService } from '../../services/toast.service';
import { Producto, ProductoGuardar } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { LogoComponent } from '../../components/logo/logo.component';
import { IconComponent } from '../../components/icon/icon.component';
import { mensajeError } from '../../utils/errores';
import { AdminPedidosComponent } from '../../components/admin-pedidos/admin-pedidos.component';

type Seccion = 'productos' | 'categorias' | 'pedidos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, LogoComponent, IconComponent, AdminPedidosComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  seccion = signal<Seccion>('productos');

  // ===== Productos =====
  productos = signal<Producto[]>([]);
  total = signal(0);
  pagina = signal(1);
  totalPaginas = signal(1);
  cargando = signal(true);
  busqueda = '';

  // Formulario de producto (modal)
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  nombre = '';
  descripcion = '';
  precio: number | null = null;
  stock: number | null = null;
  categoriaId: number | null = null;
  activo = true;
  imagenBase64: string | null = null;   // solo si se elige una imagen nueva
  vistaPrevia: string | null = null;

  // ===== Categorías =====
  categorias = signal<Categoria[]>([]);
  catEditandoId = signal<number | null>(null);
  catNombre = '';
  catDescripcion = '';

  // ===== Confirmación de borrado =====
  confirmacion = signal<{ tipo: Seccion; id: number; nombre: string } | null>(null);

  ngOnInit(): void {
    const s = this.route.snapshot.queryParamMap.get('seccion');
    if (s === 'productos' || s === 'categorias' || s === 'pedidos') this.seccion.set(s);

    this.cargarCategorias();
    this.cargarProductos();
  }

  // ---------- Carga ----------
  cargarProductos(): void {
    this.cargando.set(true);
    this.productoService.buscar(
      { busqueda: this.busqueda, pagina: this.pagina(), tamanoPagina: 10, orden: 'recientes' },
      true   // incluye los productos ocultos
    ).subscribe({
      next: r => {
        this.productos.set(r.items);
        this.total.set(r.total);
        this.totalPaginas.set(Math.max(1, r.totalPaginas));
        this.cargando.set(false);
      },
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudieron cargar los productos.'));
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: c => this.categorias.set(c),
      error: () => { }
    });
  }

  buscar(): void {
    this.pagina.set(1);
    this.cargarProductos();
  }

  irAPagina(n: number): void {
    if (n < 1 || n > this.totalPaginas()) return;
    this.pagina.set(n);
    this.cargarProductos();
  }

  // ---------- Producto: crear / editar ----------
  abrirNuevo(): void {
    this.editandoId.set(null);
    this.nombre = '';
    this.descripcion = '';
    this.precio = null;
    this.stock = null;
    this.categoriaId = null;
    this.activo = true;
    this.imagenBase64 = null;
    this.vistaPrevia = null;
    this.modalAbierto.set(true);
  }

  abrirEditar(p: Producto): void {
    this.editandoId.set(p.id);
    this.nombre = p.nombre;
    this.descripcion = p.descripcion;
    this.precio = p.precio;
    this.stock = p.stock;
    this.categoriaId = p.categoriaId;
    this.activo = p.activo;
    this.imagenBase64 = null;
    this.vistaPrevia = p.imagenUrl;
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  async onArchivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }

    try {
      const base64 = await this.comprimirImagen(file);
      this.imagenBase64 = base64;
      this.vistaPrevia = base64;
    } catch {
      this.toast.error('No se pudo leer la imagen.');
    }
  }

  // Convierte a Base64 (JPEG) reduciendo a un máximo de 800 px
  private comprimirImagen(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const max = 800;
          const escala = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  guardar(): void {
    if (!this.nombre.trim()) return void this.toast.error('El nombre no puede estar vacío.');
    if (this.precio === null || this.precio < 0) return void this.toast.error('El precio no puede ser negativo.');
    if (this.stock === null || this.stock < 0) return void this.toast.error('El stock no puede ser negativo.');

    const dto: ProductoGuardar = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      precio: this.precio,
      stock: this.stock,
      categoriaId: this.categoriaId,
      activo: this.activo
    };
    if (this.imagenBase64) dto.imagenBase64 = this.imagenBase64;

    const id = this.editandoId();
    const peticion$ = id === null
      ? this.productoService.crear(dto)
      : this.productoService.actualizar(id, dto);

    this.guardando.set(true);
    peticion$.subscribe({
      next: () => {
        this.toast.exito(id === null ? 'Producto creado.' : 'Producto actualizado.');
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarProductos();
        this.cargarCategorias();
      },
      error: e => {
        this.guardando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo guardar el producto.'));
      }
    });
  }

  // ---------- Categorías ----------
  editarCategoria(c: Categoria): void {
    this.catEditandoId.set(c.id);
    this.catNombre = c.nombre;
    this.catDescripcion = c.descripcion ?? '';
  }

  cancelarCategoria(): void {
    this.catEditandoId.set(null);
    this.catNombre = '';
    this.catDescripcion = '';
  }

  guardarCategoria(): void {
    if (!this.catNombre.trim()) return void this.toast.error('El nombre de la categoría es obligatorio.');

    const dto = { nombre: this.catNombre.trim(), descripcion: this.catDescripcion.trim() || null };
    const id = this.catEditandoId();
    const peticion$ = id === null
      ? this.categoriaService.crear(dto)
      : this.categoriaService.actualizar(id, dto);

    peticion$.subscribe({
      next: () => {
        this.toast.exito(id === null ? 'Categoría creada.' : 'Categoría actualizada.');
        this.cancelarCategoria();
        this.cargarCategorias();
        this.cargarProductos();
      },
      error: e => this.toast.error(mensajeError(e, 'No se pudo guardar la categoría.'))
    });
  }

  // ---------- Eliminar (producto o categoría) ----------
  pedirEliminar(tipo: Seccion, id: number, nombre: string): void {
    this.confirmacion.set({ tipo, id, nombre });
  }

  confirmarEliminar(): void {
    const c = this.confirmacion();
    if (!c) return;

    if (c.tipo === 'productos') {
      this.productoService.eliminar(c.id).subscribe({
        next: () => {
          this.toast.exito('Producto eliminado.');
          this.confirmacion.set(null);
          // si era el único de la última página, retrocede una
          if (this.productos().length === 1 && this.pagina() > 1) this.pagina.update(n => n - 1);
          this.cargarProductos();
          this.cargarCategorias();
        },
        error: e => {
          this.confirmacion.set(null);
          this.toast.error(mensajeError(e, 'No se pudo eliminar el producto.'));
        }
      });
    } else {
      this.categoriaService.eliminar(c.id).subscribe({
        next: () => {
          this.toast.exito('Categoría eliminada.');
          this.confirmacion.set(null);
          this.cargarCategorias();
          this.cargarProductos();
        },
        error: e => {
          this.confirmacion.set(null);
          this.toast.error(mensajeError(e, 'No se pudo eliminar la categoría.'));
        }
      });
    }
  }

  salir(): void {
    this.auth.cerrarSesion();
    this.toast.info('Sesión cerrada.');
  }
}