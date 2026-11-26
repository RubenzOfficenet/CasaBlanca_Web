import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { IEventoIngreso } from '../Model/Evento.model';
import { Observable } from 'rxjs';
import { EventoAddRequest } from '../Model/eventoAdd.interface';
import { Ubicacion } from '../Model/ubicacion.interface';
import { EstatusEvento } from '../Model/estatusEvento.interface';
import { IEventoIngresoEdit } from '../interface/EventoIngreso.interface';
import { IEventoIngresoUpdate } from '../interface/eventooingresoUpdate.interface';
import { JsonPipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class EventosingresoService {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  constructor() { }

  leeEventoIngresos(year: number, month: number): Observable<IEventoIngreso[]> {
    var url = this._apiUrl + `GetEventoingresos?year=${year}&month=${month}`;
    return this._http.get<IEventoIngreso[]>(url);
  }

  agregaEvento(eventoDTO: EventoAddRequest): Observable<number> {
    const url = this._apiUrl + 'AddEventoIngreso';
    console.log( JSON.stringify(eventoDTO, null, 2));
    debugger;
    return this._http.post<number>(url, eventoDTO);
  }

  leeSecciones(): Observable<Ubicacion[]> {
    const url = this._apiUrl + 'GetAllUbicaciones';
    return this._http.get<Ubicacion[]>(url);
  }


  leeEstatusEvento(): Observable<EstatusEvento[]> {
    const url = this._apiUrl + 'GetEstatusEvento';
    return this._http.get<EstatusEvento[]>(url);
  }


  leeEventosIngresoById(idEvento: number) {
    const url = this._apiUrl + 'GetEventoingresosById?IdEvento=' + idEvento;
    return this._http.get<IEventoIngresoEdit>(url);
  }

  updateEventosIngresoById(eventoIngresoUpdate: IEventoIngresoUpdate) {
    debugger;
    const url = this._apiUrl + 'UpdateEventoingreso';
    return this._http.put<IEventoIngresoUpdate>(url, eventoIngresoUpdate);
  }


  deleteEventosIngresoById(idEventoIngrso: number) {
    const url = this._apiUrl + 'DeleteEventoIngreso?idEvento=' + idEventoIngrso;
    return this._http.put<IEventoIngresoUpdate>(url, idEventoIngrso);
  }


}
