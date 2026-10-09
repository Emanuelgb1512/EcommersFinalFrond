import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminRegistroComponent } from './pages/admin-registro/admin-registro.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { MisPedidosComponent } from './pages/mis-pedidos/mis-pedidos.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [guestGuard] },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/registro', component: AdminRegistroComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];