export interface IUsuarioResponseDTO {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    celular: string;
    idEstatus: number;
    estatus: string;
    idInmueble: number;
    numeroCasa: string; // O number, según el tipo de dato en la BD
    idUbicacion: number;
    nombreUbicacion: string;
    idRol: number;
    rol: string;
    borrado: boolean;
}