import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.token();
  const esDeLaApi = req.url.startsWith(environment.apiUrl);

  const peticion = token && esDeLaApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token && esDeLaApi) {
        auth.cerrarSesion(false);
        toast.info('Tu sesión expiró. Inicia sesión de nuevo.');
        const destino = router.url.startsWith('/admin') ? '/admin/login' : '/login';
        router.navigate([destino], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};