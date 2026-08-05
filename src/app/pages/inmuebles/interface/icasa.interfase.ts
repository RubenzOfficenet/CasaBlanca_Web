export interface ICasaCreate {
    numeroCasa?: string;
    idubicacion:number;
    ubicacion?: string;
    cuotaDeMantenimientoBase: number;
    estadoOcupacion?: number;
    nombreTitular?: string;
    apellidosTitular?: string;
    emailTitular?: string;
    Usuario : string,
    Password: string,
    ConfirmPassword? : string,
    celularTitular?: string;
    nombreOcupante?: string;
    apellidosOcupante?: string;
    emailOcupante?: string;
    celularOcupante?: string;
    numeroHabitantes: number;
    observaciones?: string;
}
