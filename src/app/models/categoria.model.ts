export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  cantidadProductos: number;
}

export interface CategoriaGuardar {
  nombre: string;
  descripcion?: string | null;
}