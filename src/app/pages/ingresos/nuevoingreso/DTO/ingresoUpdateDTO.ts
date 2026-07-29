export interface IIngresoUpdate {
    id: number;
    idCasa: number;
    numerocasa : string;
    nombreTitular : string;
    nombreOcupante : string;
    fechaRecepcion: string;
    numeroRecibo: string;
    idConcepto: number;
    concepto: string;
    fechaConcepto: string; // Nuevo campo
    monto: number;
    observaciones?: string;
}   