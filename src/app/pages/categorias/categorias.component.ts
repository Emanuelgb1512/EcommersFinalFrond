import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { IconComponent } from '../../components/icon/icon.component';
import { RevealDirective } from '../../directives/reveal.directive';

interface Acceso {
  icono: string;
  titulo: string;
  desc: string;
  ruta: string;
  params?: Record<string, string>;
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent, IconComponent, RevealDirective],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  auth = inject(AuthService);
  private categoriaService = inject(CategoriaService);

  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  error = signal(false);
  busqueda = signal('');
  esqueletos = [1, 2, 3, 4, 5, 6, 7, 8];

  filtradas = computed(() => {
    const texto = normalizar(this.busqueda().trim());
    if (!texto) return this.categorias();
    return this.categorias().filter(c =>
      normalizar(c.nombre).includes(texto) || normalizar(c.descripcion ?? '').includes(texto)
    );
  });

  totalProductos = computed(() => this.categorias().reduce((s, c) => s + c.cantidadProductos, 0));

  tituloAccesos = computed(() =>
    this.auth.esAdmin() ? 'Administración' : this.auth.estaLogueado() ? 'Tu cuenta' : 'Accesos rápidos'
  );

  // Lo que ve cada tipo de usuario
  accesos = computed<Acceso[]>(() => {
    if (this.auth.esAdmin()) {
      return [
        { icono: 'shield', titulo: 'Panel de administración', desc: 'Vista general de la tienda', ruta: '/admin' },
        { icono: 'box', titulo: 'Gestionar productos', desc: 'Crear, editar y eliminar productos', ruta: '/admin', params: { seccion: 'productos' } },
        { icono: 'tag', titulo: 'Gestionar categorías', desc: 'Crear y editar las categorías', ruta: '/admin', params: { seccion: 'categorias' } },
        { icono: 'truck', titulo: 'Pedidos y pagos', desc: 'Pendientes, en proceso y pagados', ruta: '/admin', params: { seccion: 'pedidos' } },
        { icono: 'user', titulo: 'Mi perfil', desc: 'Tus datos y tu foto', ruta: '/perfil' },
        { icono: 'cart', titulo: 'Mi carrito', desc: 'Revisa lo que quieres comprar', ruta: '/carrito' }
      ];
    }
    if (this.auth.estaLogueado()) {
      return [
        { icono: 'user', titulo: 'Mi perfil', desc: 'Tus datos y tu foto', ruta: '/perfil' },
        { icono: 'truck', titulo: 'Mis pedidos', desc: 'Sigue el estado de tus compras', ruta: '/mis-pedidos' },
        { icono: 'cart', titulo: 'Mi carrito', desc: 'Revisa lo que quieres comprar', ruta: '/carrito' },
        { icono: 'box', titulo: 'Todos los productos', desc: 'Mira el catálogo completo', ruta: '/' }
      ];
    }
    return [
      { icono: 'user', titulo: 'Iniciar sesión', desc: 'Entra a tu cuenta', ruta: '/login' },
      { icono: 'plus', titulo: 'Crear cuenta', desc: 'Regístrate para comprar', ruta: '/registro' },
      { icono: 'cart', titulo: 'Mi carrito', desc: 'Revisa lo que quieres comprar', ruta: '/carrito' },
      { icono: 'shield', titulo: 'Acceso administrador', desc: 'Solo para el equipo de la tienda', ruta: '/admin/login' }
    ];
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: c => { this.categorias.set(c); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); }
    });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
  }
}