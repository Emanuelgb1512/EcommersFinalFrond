import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilDatos, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/Usuario`;

  obtener(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.api}/Perfil`);
  }

  actualizar(datos: PerfilDatos): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/Perfil`, datos);
  }

  subirFoto(imagenBase64: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/Perfil/Foto`, { imagenBase64 });
  }

  quitarFoto(): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.api}/Perfil/Foto`);
  }

  cambiarPassword(passwordActual: string | null, passwordNueva: string): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.api}/Cambiar-Password`, { passwordActual, passwordNueva });
  }
}