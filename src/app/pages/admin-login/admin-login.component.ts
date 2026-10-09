import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../../components/icon/icon.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, LogoComponent],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  mostrarPassword = false;
  cargando = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.auth.esAdmin()) this.router.navigate(['/admin']);
  }

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
      next: () => {
        // Solo pasan las cuentas con rol Admin
        if (!this.auth.esAdmin()) {
          this.auth.cerrarSesion(false);
          this.cargando.set(false);
          this.toast.error('Esta cuenta no tiene permisos de administrador.');
          return;
        }
        this.toast.exito('Bienvenido al panel de administración.');
        this.router.navigate(['/admin']);
      },
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo iniciar sesión.'));
      }
    });
  }
}