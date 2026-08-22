export interface IListaEventoEgreso {
    id: number;
    idEventoIngreso: number;
    idUbicacion: number;
    fechaEvento: string;
    nombreUbicacion: string;
    numeroCasa: string;
    conceptoEgreso: string;
    montoEgreso: number;
    fechaEgreso: string;
    observaciones?: string;    
}