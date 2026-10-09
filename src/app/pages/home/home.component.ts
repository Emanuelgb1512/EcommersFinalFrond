import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { IconComponent } from '../../components/icon/icon.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NavbarComponent, FooterComponent, IconComponent, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private carrito = inject(CarritoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  total = signal(0);
  pagina = signal(1);
  totalPaginas = signal(1);
  cargando = signal(true);
  error = signal('');

  busqueda = signal('');
  categoriaId = signal<number | null>(null);
  orden = signal('recientes');
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);

  seleccionado = signal<Producto | null>(null);
  cantidadModal = signal(1);

  esqueletos = [1, 2, 3, 4, 5, 6, 7, 8];
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  categoriaActual = computed(() =>
    this.categorias().find(c => c.id === this.categoriaId())?.nombre ?? null
  );
  hayFiltros = computed(() =>
    !!this.busqueda() || this.categoriaId() !== null ||
    this.precioMin() !== null || this.precioMax() !== null
  );

  private peticion = 0;

  ngOnInit(): void {
    // Solo para mostrar el nombre de la categoría activa
    this.categoriaService.listar().subscribe({
      next: c => this.categorias.set(c),
      error: () => { }
    });

    // El buscador del navbar y la página de categorías mandan sus datos por la URL
    this.route.queryParamMap.subscribe(params => {
      this.busqueda.set(params.get('busqueda') ?? '');
      const cat = Number(params.get('categoriaId'));
      this.categoriaId.set(cat > 0 ? cat : null);
      this.pagina.set(1);
      this.cargar();
    });
  }

  cargar(): void {
    const id = ++this.peticion;
    this.cargando.set(true);
    this.error.set('');

    this.productoService.buscar({
      busqueda: this.busqueda(),
      categoriaId: this.categoriaId(),
      precioMin: this.precioMin(),
      precioMax: this.precioMax(),
      orden: this.orden(),
      pagina: this.pagina(),
      tamanoPagina: 12
    }).subscribe({
      next: r => {
        if (id !== this.peticion) return;
        this.productos.set(r.items);
        this.total.set(r.total);
        this.totalPaginas.set(Math.max(1, r.totalPaginas));
        this.cargando.set(false);
      },
      error: () => {
        if (id !== this.peticion) return;
        this.error.set('No se pudieron cargar los productos. Verifica que la API esté en ejecución.');
        this.cargando.set(false);
      }
    });
  }

  // ===== Filtros =====
  cambiarOrden(valor: string): void {
    this.orden.set(valor);
    this.pagina.set(1);
    this.cargar();
  }

  aplicarPrecio(min: string, max: string): void {
    this.precioMin.set(min.trim() === '' ? null : Number(min));
    this.precioMax.set(max.trim() === '' ? null : Number(max));
    this.pagina.set(1);
    this.cargar();
  }

  // Quita la categoría de la URL (la suscripción a la URL vuelve a cargar los productos)
  quitarCategoria(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoriaId: null },
      queryParamsHandling: 'merge',
      fragment: 'productos'
    });
  }

  limpiar(): void {
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.orden.set('recientes');
    this.pagina.set(1);

    if (this.categoriaId() !== null) this.quitarCategoria();
    else this.cargar();
  }

  irAPagina(n: number): void {
    if (n < 1 || n > this.totalPaginas() || n === this.pagina()) return;
    this.pagina.set(n);
    this.cargar();
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== Carrito y vista rápida =====
  agregar(p: Producto): void {
    this.carrito.agregar(p, 1);
  }

  abrir(p: Producto): void {
    this.seleccionado.set(p);
    this.cantidadModal.set(1);
  }

  @HostListener('document:keydown.escape')
  cerrar(): void {
    this.seleccionado.set(null);
  }

  cambiarCantidad(delta: number): void {
    const p = this.seleccionado();
    if (!p) return;
    const nueva = this.cantidadModal() + delta;
    this.cantidadModal.set(Math.min(Math.max(1, nueva), Math.max(1, p.stock)));
  }

  agregarDesdeModal(): void {
    const p = this.seleccionado();
    if (!p) return;
    this.carrito.agregar(p, this.cantidadModal());
    this.cerrar();
  }
}