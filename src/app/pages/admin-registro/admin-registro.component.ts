import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../../components/icon/icon.component';
import { LogoComponent } from '../../components/logo/logo.component';
import { mensajeError } from '../../utils/errores';

function coinciden(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('password')?.value === grupo.get('confirmar')?.value ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-admin-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, LogoComponent],
  templateUrl: './admin-registro.component.html',
  styleUrl: './admin-registro.component.css'
})
export class AdminRegistroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  mostrarPassword = false;
  mostrarConfirmar = false;
  mostrarClave = false;
  cargando = signal(false);

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
      claveAdmin: ['', [Validators.required]]
    },
    { validators: coinciden }
  );

  ngOnInit(): void {
    if (this.auth.esAdmin()) this.router.navigate(['/admin']);
  }

  invalido(campo: 'nombre' | 'email' | 'password' | 'confirmar' | 'claveAdmin'): boolean {
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
    const { nombre, email, password, claveAdmin } = this.form.getRawValue();
    this.cargando.set(true);

    this.auth.registrarAdmin({ nombre, email, password, claveAdmin }).subscribe({
      next: () => {
        this.toast.exito('Cuenta de administrador creada. ¡Bienvenido!');
        this.router.navigate(['/admin']);
      },
      error: e => {
        this.cargando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo crear la cuenta de administrador.'));
      }
    });
  }
}