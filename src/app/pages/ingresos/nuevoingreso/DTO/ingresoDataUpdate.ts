export interface IIngresoDataUpdate {
    id: number;
    idCasa: number;
    fechaRecepcion: string;
    numeroRecibo: string;
    idConcepto: number;
    fechaConcepto: string; // Nuevo campo
    monto: number;
    observaciones?: string;
}   
