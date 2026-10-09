import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheckoutDatos, Pedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/Pedido`;

  checkout(datos: CheckoutDatos): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.api}/Checkout`, datos);
  }

  misPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.api}/Mis-Pedidos`);
  }

  cancelar(id: number): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.api}/${id}/Cancelar`, {});
  }

  // Solo administrador
  todos(estado?: string): Observable<Pedido[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<Pedido[]>(`${this.api}/Todos`, { params });
  }

  cambiarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.api}/${id}/Estado`, { estado });
  }

  cambiarEstadoPago(id: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.api}/${id}/Pago`, { estado });
  }
}