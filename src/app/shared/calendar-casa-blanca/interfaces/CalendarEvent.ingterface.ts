export interface CalendarEvent {
  id: string;
  idInmueble: number;
  idEstatusEvento: number;
  fechaEvento: string;
  reciboNumero: string;
  fechaPago: string;
  apartado: number;
  liquida: number;
  luz: number;
  depositoGarantia: number;
  limpiezaDomingo: number;
  rentaInmobiliario: number;
  comentarios: string;

  // Propiedades auxiliares de presentación UI
  houseName?: string;
  personName?: string;
  color?: string;
}
