export interface EventoCalendarYearMont {
    id: number;
    idInmueble: number;
    idEstatusEvento: number;
    estatusEvento: string;
    fechaEvento: string;
    reciboNumero?: string | null;
    fechaPago?: string | null;
    apartado: number;
    liquida: number;
    luz: number;
    depositoGarantia: number;
    limpiezaDomingo: number;
    rentaInmobiliario: number;
    comentarios?: string | null;
    idCasa: number;
    numeroCasa: string;
    idUbicacion: number;
    nombreUbicacion: string;
    borrado: boolean;
    nombre?: string | null;
    apellidos?: string | null;
}