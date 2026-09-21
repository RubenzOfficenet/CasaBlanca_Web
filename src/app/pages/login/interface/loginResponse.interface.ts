export interface LoginRespondeDTO {
    id: number;
    email?: string;
    password?: string;
    debeCambiarPassword: boolean;
    idUsuario: number; // Respeta el nombre de la propiedad C# (si corriges el typo en C# a IdUsuario, cámbialo aquí a idUsuario)
    nombre?: string;
    apellidos?: string;
    rol?: string;
}