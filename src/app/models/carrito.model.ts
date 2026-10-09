export interface CarritoItem {
  productoId: number;
  nombre: string;
  imagenUrl: string | null;
  precioUnitario: number;
  cantidad: number;
  stock: number;
  activo: boolean;
  subtotal: number;
}

export interface Carrito {
  items: CarritoItem[];
  total: number;
  cantidadTotal: number;
}