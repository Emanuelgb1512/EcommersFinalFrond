import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { ToastService } from '../../services/toast.service';
import { Pedido } from '../../models/pedido.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { IconComponent } from '../../components/icon/icon.component';
import { aFecha, claseEstado, etiquetaPago } from '../../utils/estados';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, NavbarComponent, FooterComponent, IconComponent],
  templateUrl: './mis-pedidos.component.html',
  styleUrl: './mis-pedidos.component.css'
})
export class MisPedidosComponent implements OnInit {
  private service = inject(PedidoService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  pedidos = signal<Pedido[]>([]);
  cargando = signal(true);
  nuevoId = Number(this.route.snapshot.queryParamMap.get('nuevo')) || null;

  claseEstado = claseEstado;
  etiquetaPago = etiquetaPago;
  fecha = aFecha;

  ngOnInit(): void {
    this.service.misPedidos().subscribe({
      next: lista => { this.pedidos.set(lista); this.cargando.set(false); },
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudieron cargar tus pedidos.'));
      }
    });
  }

  puedeCancelar(p: Pedido): boolean {
    return p.estado === 'Pendiente' || p.estado === 'Pagado';
  }

  cancelar(p: Pedido): void {
    if (!confirm(`¿Cancelar el pedido #${p.id}?`)) return;

    this.service.cancelar(p.id).subscribe({
      next: actualizado => {
        this.pedidos.update(l => l.map(x => x.id === actualizado.id ? actualizado : x));
        this.toast.exito('Pedido cancelado.');
      },
      error: e => this.toast.error(mensajeError(e, 'No se pudo cancelar el pedido.'))
    });
  }
}