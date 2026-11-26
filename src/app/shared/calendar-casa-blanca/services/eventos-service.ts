import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


import { CalendarEvent } from '../interfaces/CalendarEvent.interface';
import { CasasList } from '../interfaces/ICasasList.interfgace';
import { SectionOption } from '../interfaces/SectionOption.interface';
import { EventoCalendarYearMont } from '../interfaces/EventoCalendarYearMont.interface';

import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { InmuebleEditarDTO } from '../../../Models/InmuebleEditarDTO.model';
import { InmueblesServices } from '../../../pages/inmuebles/services/inmuebles-services';
import { EventoCalendarDto } from '../interfaces/EventoCalendarDto.interace';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private http = inject(HttpClient);
  private readonly catalogosService = inject(InmueblesServices);
  private readonly apiSeccionesUrl = APP_CONSTANTS.URL_LOCAL + 'GetAllUbicaciones'
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;
  private readonly _http = inject(HttpClient);

  inmuebleSeleccionado = signal<InmuebleEditarDTO | null>(null);
  eventos: EventoCalendarYearMont[] = [];


  Evento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this._apiUrl, evento);
  }

  updateEvento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this._apiUrl}/${evento.id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this._apiUrl}/${id}`);
  }

  // Obtener la lista de casas
  getCasas(sectionId: number): Observable<CasasList[]> {
    const url = `${this._apiUrl}GetCasasByUbicacion?IdUbicacion=${sectionId}`;
    return this._http.get<CasasList[]>(url);
  }



  // Obtener la lista de secciones
  getSecciones(): Observable<SectionOption[]> {
    // -------------------------------------------------------------------------
    // Llamado real al Web API (descomentar al conectar backend):
    // return this.http.get<SectionOption[]>(this.apiSeccionesUrl);
    // -------------------------------------------------------------------------

    const mockSecciones: SectionOption[] = [
      { id: 1, name: 'Sección I' },
      { id: 2, name: 'Sección II' }
    ];

    return of(mockSecciones);
  }



  getCalendarEventsByYearMonth(year: number, month: number): Observable<EventoCalendarDto[]> {
    const url = `${this._apiUrl}GetEventosCalendario?year=${year}&month=${month}`;
    debugger;
    return this.http.get<EventoCalendarDto[]>(`${this._apiUrl}GetEventosCalendario?year=${year}&month=${month}`);
  }


  

} // END CLASS