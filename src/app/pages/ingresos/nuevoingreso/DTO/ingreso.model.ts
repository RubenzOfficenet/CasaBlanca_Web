export interface IIngreso {
  casa: string;
  nombre: string;
  fechaRecepcion: string;
  numeroRecibo: string;
  concepto: string;
  fechaConcepto: string; // Nuevo campo
  monto: number;
  observaciones?: string;
}   