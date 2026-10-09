export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  activo: boolean;
  categoriaId: number | null;
  categoriaNombre: string | null;
}

export interface ProductoGuardar {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number | null;
  activo: boolean;
  imagenBase64?: string | null;   // solo si hay imagen nueva
}

export interface ProductoFiltro {
  busqueda?: string;
  categoriaId?: number | null;
  precioMin?: number | null;
  precioMax?: number | null;
  orden?: string;                  // precio_asc | precio_desc | nombre | recientes
  pagina?: number;
  tamanoPagina?: number;
}