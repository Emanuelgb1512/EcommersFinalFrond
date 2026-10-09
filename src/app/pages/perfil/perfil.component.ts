import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../services/toast.service';
import { Usuario } from '../../models/usuario.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { IconComponent } from '../../components/icon/icon.component';
import { mensajeError } from '../../utils/errores';

function coinciden(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('nueva')?.value === grupo.get('confirmar')?.value ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NavbarComponent, FooterComponent, AvatarComponent, IconComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  auth = inject(AuthService);
  private usuarios = inject(UsuarioService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  guardando = signal(false);
  subiendoFoto = signal(false);
  cambiandoPass = signal(false);
  mostrarPass = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(30)]],
    direccion: ['', [Validators.maxLength(200)]],
    ciudad: ['', [Validators.maxLength(100)]]
  });

  passForm = this.fb.nonNullable.group(
    {
      actual: [''],
      nueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]]
    },
    { validators: coinciden }
  );

  ngOnInit(): void {
    this.cargarForm(this.auth.usuario());

    // Trae los datos más recientes del servidor
    this.usuarios.obtener().subscribe({
      next: u => { this.auth.actualizarUsuario(u); this.cargarForm(u); },
      error: () => { }
    });
  }

  private cargarForm(u: Usuario | null): void {
    if (!u) return;
    this.form.patchValue({
      nombre: u.nombre,
      telefono: u.telefono ?? '',
      direccion: u.direccion ?? '',
      ciudad: u.ciudad ?? ''
    });
  }

  invalidoForm(campo: 'nombre' | 'telefono' | 'direccion' | 'ciudad'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  invalidoPass(campo: 'nueva' | 'confirmar'): boolean {
    const c = this.passForm.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  noCoinciden(): boolean {
    return this.passForm.hasError('noCoinciden') && this.passForm.controls.confirmar.touched;
  }

  // ===== Datos personales =====
  guardarDatos(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);

    this.usuarios.actualizar({
      nombre: v.nombre.trim(),
      telefono: v.telefono.trim() || null,
      direccion: v.direccion.trim() || null,
      ciudad: v.ciudad.trim() || null
    }).subscribe({
      next: u => {
        this.auth.actualizarUsuario(u);
        this.guardando.set(false);
        this.toast.exito('Perfil actualizado.');
      },
      error: e => {
        this.guardando.set(false);
        this.toast.error(mensajeError(e, 'No se pudo guardar el perfil.'));
      }
    });
  }

  // ===== Foto de perfil =====
  async onFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }

    try {
      const base64 = await this.recortarCuadrado(file);
      this.subiendoFoto.set(true);

      this.usuarios.subirFoto(base64).subscribe({
        next: u => {
          this.auth.actualizarUsuario(u);
          this.subiendoFoto.set(false);
          this.toast.exito('Foto de perfil actualizada.');
          input.value = '';
        },
        error: e => {
          this.subiendoFoto.set(false);
          this.toast.error(mensajeError(e, 'No se pudo subir la foto.'));
          input.value = '';
        }
      });
    } catch {
      this.toast.error('No se pudo leer la imagen.');
      input.value = '';
    }
  }

  quitarFoto(): void {
    this.subiendoFoto.set(true);
    this.usuarios.quitarFoto().subscribe({
      next: u => {
        this.auth.actualizarUsuario(u);
        this.subiendoFoto.set(false);
        this.toast.info('Foto eliminada.');
      },
      error: e => {
        this.subiendoFoto.set(false);
        this.toast.error(mensajeError(e, 'No se pudo quitar la foto.'));
      }
    });
  }

  // Recorta el centro de la imagen en un cuadrado de máximo 400 px (JPEG en Base64)
  private recortarCuadrado(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const lado = Math.min(img.width, img.height);
          const sx = (img.width - lado) / 2;
          const sy = (img.height - lado) / 2;
          const tam = Math.min(400, lado);

          const canvas = document.createElement('canvas');
          canvas.width = tam;
          canvas.height = tam;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, tam, tam);
          ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tam, tam);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== Contraseña =====
  cambiarPassword(): void {
    if (this.passForm.invalid) {
      this.passForm.markAllAsTouched();
      return;
    }
    const v = this.passForm.getRawValue();
    this.cambiandoPass.set(true);

    this.usuarios.cambiarPassword(v.actual || null, v.nueva).subscribe({
      next: () => {
        this.cambiandoPass.set(false);
        this.passForm.reset();
        this.toast.exito('Contraseña actualizada.');
      },
      error: e => {
        this.cambiandoPass.set(false);
        this.toast.error(mensajeError(e, 'No se pudo cambiar la contraseña.'));
      }
    });
  }
}