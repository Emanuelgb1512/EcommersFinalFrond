import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, CategoriaGuardar } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/Categoria`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.api}/Listar`);
  }

  crear(datos: CategoriaGuardar): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.api}/Crear`, datos);
  }

  actualizar(id: number, datos: CategoriaGuardar): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.api}/Actualizar/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/Eliminar/${id}`);
  }
}