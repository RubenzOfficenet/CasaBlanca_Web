export interface IIngresoDTO {
    idCasa: string;
    fechaRecepcion: string;
    numeroRecibo: string;
    idConcepto: number;
    fechaConcepto: string;
    monto: number;
    observaciones?: string;
}  