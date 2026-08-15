export interface IEventoIngresoUpdate {
    id: number;
    idInmueble: number;
    idEstatusEvento: number
    fechaEvento: string;
    reciboNumero: string;
    fechaPago: string;
    apartado: number;
    liquida: number;
    luz: number;
    depositoGarantia: number;
    limpiezaDomingo: number;
    rentaInmobiliario: number;
}
