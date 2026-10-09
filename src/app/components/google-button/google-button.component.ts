import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject, output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

declare const google: any;

@Component({
  selector: 'app-google-button',
  standalone: true,
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.css'
})
export class GoogleButtonComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private toast = inject(ToastService);

  credencial = output<string>();
  hayClientId = !!environment.googleClientId;

  @ViewChild('contenedor') contenedor?: ElementRef<HTMLDivElement>;
  private intervalo?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void {
    if (!this.hayClientId) return;

    let intentos = 0;
    this.intervalo = setInterval(() => {
      intentos++;
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        clearInterval(this.intervalo);
        this.iniciar();
      } else if (intentos > 50) {
        clearInterval(this.intervalo);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  sinConfigurar(): void {
    this.toast.info('El inicio con Google aún no está configurado. Falta agregar el Client ID.');
  }

  private iniciar(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp: { credential: string }) =>
        this.zone.run(() => this.credencial.emit(resp.credential))
    });

    if (this.contenedor) {
      google.accounts.id.renderButton(this.contenedor.nativeElement, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320,
        locale: 'es'
      });
    }
  }
}