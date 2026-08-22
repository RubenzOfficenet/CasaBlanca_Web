// Modelos basados en el diagrama: Inmueble, Evento, PagosEvento, ConceptoPago

export interface IEventoIngreso {
  id: number;
  idinmueble: number;
  idestatusevento: number
  idubicacion: number;
  nombreubicacion: string;
  numerocasa: string;
  fechavento: string;      
  nombretitular: string;
  apellidostitular: string;
  recibonumero: string;
  fechapago: string;
  apartado: number;
  liquida: number;
  luz: number;
  depositogarantia: number;
  limpiezadomingo: number;
  rentainmobiliario: number;
  estatusevento: string;
  total: number;
  TotalEgresos : number;
}

