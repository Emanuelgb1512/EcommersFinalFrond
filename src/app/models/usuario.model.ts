export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;            // 'Admin' | 'Cliente'
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  fotoUrl?: string | null;
  activo: boolean;
  fechaRegistro: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface LoginDatos {
  email: string;
  password: string;
}

export interface RegistroDatos {
  nombre: string;
  email: string;
  password: string;
}

export interface PerfilDatos {
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
}

export interface RegistroAdminDatos extends RegistroDatos {
  claveAdmin: string;
}