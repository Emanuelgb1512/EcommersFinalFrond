import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse, LoginDatos, RegistroAdminDatos, RegistroDatos, Usuario
} from '../models/usuario.model';

const CLAVE_TOKEN = 'sz_token';
const CLAVE_USUARIO = 'sz_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/Auth`;

  private _token = signal<string | null>(this.tokenInicial());
  private _usuario = signal<Usuario | null>(this.usuarioInicial());

  token = this._token.asReadonly();
  usuario = this._usuario.asReadonly();
  estaLogueado = computed(() => !!this._token() && !!this._usuario());
  esAdmin = computed(() => this._usuario()?.rol === 'Admin');

  registrar(datos: RegistroDatos): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/Register`, datos)
      .pipe(tap(res => this.guardarSesion(res)));
  }

  registrarAdmin(datos: RegistroAdminDatos): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/Register-Admin`, datos)
      .pipe(tap(res => this.guardarSesion(res)));
  }

  login(datos: LoginDatos): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/Login`, datos)
      .pipe(tap(res => this.guardarSesion(res)));
  }

  google(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/Google`, { credential })
      .pipe(tap(res => this.guardarSesion(res)));
  }

  cerrarSesion(redirigir = true): void {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch { /* sin almacenamiento */ }
    this._token.set(null);
    this._usuario.set(null);
    if (redirigir) this.router.navigate(['/']);
  }

  // Para cuando el usuario edita su perfil
  actualizarUsuario(usuario: Usuario): void {
    this._usuario.set(usuario);
    try { localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario)); } catch { }
  }

  // ===== Internos =====
  private guardarSesion(res: AuthResponse): void {
    try {
      localStorage.setItem(CLAVE_TOKEN, res.token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(res.usuario));
    } catch { }
    this._token.set(res.token);
    this._usuario.set(res.usuario);
  }

  private tokenInicial(): string | null {
    try {
      const token = localStorage.getItem(CLAVE_TOKEN);
      if (token && !this.tokenExpirado(token)) return token;
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch { }
    return null;
  }

  private usuarioInicial(): Usuario | null {
    try {
      if (!localStorage.getItem(CLAVE_TOKEN)) return null;
      const texto = localStorage.getItem(CLAVE_USUARIO);
      return texto ? JSON.parse(texto) as Usuario : null;
    } catch {
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return !payload.exp || payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}