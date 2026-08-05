export interface InmuebleEditarDTO {
    id: number;
    numeroCasa?: string;
    idUbicacion?: string;
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
    
    Usuario: string;
    Password? : string;
    ConfirmPassword? : string;
    Observaciones? : string;

    numeroHabitantes?: number;
    observaciones?: string;


}