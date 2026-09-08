export interface IUsuarioNuevo {
    nombreUsuario: string;
    apellidosUsuario: string;
    celularUsuario: string;
    emailUsuario: string;
    password: string;
    confirmarPassword : string
    idUbicacion :number;
    idInmueble: number;
    idRol: number;
    idEstatus: number;
    idTipoRelacion?: number;
}

