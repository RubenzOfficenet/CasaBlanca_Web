export interface ICasas {
    id: number;
    numeroCasa?: string;
    CuotaDeMantenimientoBase: number;
    EstadoInicialOcupacion: string;
    nombreTitular?: string;
    emailTitular?: string;
    celularTitular?: string;
    nombreOcupante? :string;
    emailOcupante? : string;
    celularOcupante? : string;
    numeroHabitantes: number;

}