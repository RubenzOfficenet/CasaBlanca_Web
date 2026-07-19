export interface iupdateCasa {
    id: number;
    numeroCasa?: string;
    ubicacion?: string;
    cuotaDeMantenimientoBase: number;
    estadoOcupacion?: number;
    nombreTitular?: string;
    apellidosTitular?: string;
    emailTitular?: string;
    celularTitular?: string;
    nombreOcupante?: string;
    apellidosOcupante?: string;
    emailOcupante?: string;
    celularOcupante?: string;
    numeroHabitantes: number;
    observaciones?: string;
}
