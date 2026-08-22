import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../../Constants/app.constants';
import { ICatalogoEventoEgreso } from '../interface/icatalogo-evento-egreso';
import { Observable } from 'rxjs';
import { IEventoEgreso } from '../interface/ievento-egreso';
import { IListaEventoEgreso } from '../interface/IListaEventoEgreso.interface';

@Injectable({
  providedIn: 'root',
})
export class Eventoegresoservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  constructor() { }

  leeCatalogoEventoEgrso(): Observable<ICatalogoEventoEgreso[]> {
    var url = this._apiUrl + 'GetConceptoEventoEgreso';
    return this._http.get<ICatalogoEventoEgreso[]>(url);
  }

  addEgresoEvento(eventoEgreso: IEventoEgreso): Observable<Number> {
    var url = this._apiUrl + 'AddEventoEgreso';
    return this._http.post<Number>(url, eventoEgreso);
  }

  leeListaEventoEgreso(IdEventoEgreso: number): Observable<IListaEventoEgreso[]> {
    var url = this._apiUrl + 'GetListaEventoEgresos?IdEventoEgreso=' + IdEventoEgreso;
    return this._http.get<IListaEventoEgreso[]>(url);
  }



}
