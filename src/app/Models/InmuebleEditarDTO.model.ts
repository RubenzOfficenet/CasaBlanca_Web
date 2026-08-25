export interface InmuebleEditarDTO {
    id: number;
    numeroCasa?: string;
    idUbicacion: number;
    cuotaDeMantenimientoBase: number;
    idEstadoOcupacion?: number;
    numeroHabitantes: number;
    observaciones?: string;
}