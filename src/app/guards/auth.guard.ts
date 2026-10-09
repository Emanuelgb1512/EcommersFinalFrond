import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Exige sesión iniciada (carrito de usuario, checkout, pedidos, perfil)
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.estaLogueado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Exige ser administrador
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaLogueado()) return router.createUrlTree(['/admin/login']);
  return auth.esAdmin() ? true : router.createUrlTree(['/']);
};

// Para login y registro: si ya hay sesión, manda al inicio
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaLogueado() ? router.createUrlTree(['/']) : true;
};