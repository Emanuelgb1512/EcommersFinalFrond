import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { GoogleButtonComponent } from '../../components/google-button/google-button.component';
import { mensajeError } from '../../utils/errores';
import { IconComponent } from '../../components/icon/icon.component';
import { LogoComponent } from '../../components/logo/logo.component';

// imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent, IconComponent, LogoComponent],

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent, IconComponent, LogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mostrarPassword = false;
  cargando = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  invalido(campo: 'email' | 'password'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.alEntrar(),
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo iniciar sesión.'));
      }
    });
  }

  onGoogle(credential: string): void {
    this.cargando.set(true);
    this.auth.google(credential).subscribe({
      next: () => this.alEntrar(),
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo iniciar sesión con Google.'));
      }
    });
  }

  private alEntrar(): void {
    this.toast.exito(`¡Bienvenido, ${this.auth.usuario()?.nombre}!`);
    const destino = this.route.snapshot.queryParamMap.get('returnUrl');
    // Solo se aceptan rutas internas
    const seguro = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/';
    this.router.navigateByUrl(seguro);
  }
}