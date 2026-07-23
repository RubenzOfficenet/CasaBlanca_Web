export interface IIngresoResponse {
  numeroCasa: string;
  nombreTitular: string;
  fechaRecepcion: string;
  numeroRecibo: string;
  concepto: string;
  fechaConcepto: string; // Nuevo campo
  monto: number;
  observaciones?: string;
}   