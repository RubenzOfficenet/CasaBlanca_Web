export interface IResumenanalitico {
    fechaDeOperacion: string;
    concepto: string;
    ubicacion: string;
    casa: string;
    tipo: string;
    monto: number;
    observaciones?: string;
    totalIngresos: number;
    totalEgresos: number;
}