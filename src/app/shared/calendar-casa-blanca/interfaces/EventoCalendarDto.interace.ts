export interface EventoCalendarDto {
    id: number;
    idInmueble: number;
    idEstatusEvento: number;
    estatusEvento: string;
    fechaEvento: string; // ASP.NET envía DateTime en formato ISO string (ej. "2026-11-11T00:00:00")
    reciboNumero: number; // Cambia a 'string' si decidiste aceptar folios alfanuméricos
    fechaPago: string;
    apartado: number;
    liquida: number;
    luz: number;
    depositoGarantia: number;
    limpiezaDomingo: number;
    rentaInmobiliario: number;
    borrado: boolean;
    nombreUbicac: string;
}
