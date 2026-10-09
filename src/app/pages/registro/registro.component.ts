import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { GoogleButtonComponent } from '../../components/google-button/google-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { mensajeError } from '../../utils/errores';

function coinciden(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return password === confirmar ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent, IconComponent, LogoComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mostrarPassword = false;
  mostrarConfirmar = false;
  cargando = signal(false);

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]]
    },
    { validators: coinciden }
  );

  invalido(campo: 'nombre' | 'email' | 'password' | 'confirmar'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  noCoinciden(): boolean {
    return this.form.hasError('noCoinciden') && this.form.controls.confirmar.touched;
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, email, password } = this.form.getRawValue();
    this.cargando.set(true);

    this.auth.registrar({ nombre, email, password }).subscribe({
      next: () => this.alEntrar('¡Cuenta creada! Bienvenido.'),
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo crear la cuenta.'));
      }
    });
  }

  onGoogle(credential: string): void {
    this.cargando.set(true);
    this.auth.google(credential).subscribe({
      next: () => this.alEntrar(`¡Bienvenido, ${this.auth.usuario()?.nombre}!`),
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo registrar con Google.'));
      }
    });
  }

  private alEntrar(mensaje: string): void {
    this.toast.exito(mensaje);
    const destino = this.route.snapshot.queryParamMap.get('returnUrl');
    // Solo se aceptan rutas internas
    const seguro = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/';
    this.router.navigateByUrl(seguro);
  }
}