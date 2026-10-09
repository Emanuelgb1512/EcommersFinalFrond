export interface PedidoItem {
  productoId: number;
  nombre: string;
  imagenUrl: string | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  subtotal: number;
  impuestos: number;
  total: number;
  direccionEnvio: string;
  ciudad: string;
  telefono: string;
  clienteNombre: string;
  clienteEmail: string;
  metodoPago: string | null;
  estadoPago: string | null;
  referencia: string | null;
  items: PedidoItem[];
}

export interface CheckoutDatos {
  direccionEnvio: string;
  ciudad: string;
  telefono: string;
  metodoPago: string;
}