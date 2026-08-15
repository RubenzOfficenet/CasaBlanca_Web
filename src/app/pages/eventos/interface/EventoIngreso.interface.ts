export interface IEventoIngresoEdit {
  id: number;
  idInmueble: number;
  idEstatusEvento: number
  idUbicacion: number;
  nombreUbicacion: string;
  numeroCasa: string;
  fechaEvento: string;      
  nombreTitular: string;
  apellidosTitular: string;
  nombreOcupante: string;
  reciboNumero: string;
  fechaPago: string;
  apartado: number;
  liquida: number;
  luz: number;
  depositoGarantia: number;
  limpiezaDomingo: number;
  rentaInmobiliario: number;
  estatusEvento: string;
  total: number;
}
