export interface IIngresoResponse {
  numerocasa: string;
  nombretitular: string;
  fechaRecepcion: string;
  numeroRecibo: string;
  concepto: string;
  fechaConcepto: string; // Nuevo campo
  monto: number;
  observaciones?: string;
}   