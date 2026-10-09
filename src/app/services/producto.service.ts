import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResult } from '../models/paginado.model';
import { Producto, ProductoFiltro, ProductoGuardar } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/Producto`;

  buscar(filtro: ProductoFiltro = {}, incluirInactivos = false): Observable<PagedResult<Producto>> {
    let params = new HttpParams();
    Object.entries(filtro).forEach(([clave, valor]) => {
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    if (incluirInactivos) params = params.set('incluirInactivos', true);

    return this.http.get<PagedResult<Producto>>(`${this.api}/Obtener-Producto`, { params });
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.api}/Obtener-Producto/${id}`);
  }

  crear(datos: ProductoGuardar): Observable<Producto> {
    return this.http.post<Producto>(`${this.api}/Crear-producto`, datos);
  }

  actualizar(id: number, datos: ProductoGuardar): Observable<Producto> {
    return this.http.put<Producto>(`${this.api}/Actualizar-Producto/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/Eliminar-producto/${id}`);
  }
}