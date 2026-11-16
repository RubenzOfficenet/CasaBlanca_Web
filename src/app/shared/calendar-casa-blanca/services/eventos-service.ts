import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


import { CalendarEvent  } from '../interfaces/CalendarEvent.interface';
import { CasaOption     } from '../interfaces/CasaOption.interface';
import { SectionOption  } from '../interfaces/SectionOption.interface';
import { EventoCalendarYearMont } from '../interfaces/EventoCalendarYearMont.interface';

import { APP_CONSTANTS } from '../../../Constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private http = inject(HttpClient);

  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  eventos : EventoCalendarYearMont[] = [];


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
  getCasas(sectionId?: number): Observable<CasaOption[]> {

    const mockCasas: CasaOption[] = [
      { id: 101, sectionId: 1, name: '1-A', nombre: 'Juan' },
      { id: 102, sectionId: 1, name: '2-B', nombre: 'Pedro' },
      { id: 103, sectionId: 1, name: '3-C', nombre: 'Maria' },
      { id: 104, sectionId: 1, name: '4-H', nombre: 'Jose' },
      { id: 201, sectionId: 2, name: '16-A', nombre: 'Martha' },
      { id: 202, sectionId: 2, name: '44-C', nombre: 'Carlos' },
      { id: 203, sectionId: 2, name: '22-A', nombre: 'Ana' }
    ];

    const result = sectionId !== undefined
      ? mockCasas.filter(casa => casa.sectionId === sectionId)
      : mockCasas;

    return of(result);
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



getCalendarEventsByYearMonth(year: number, month: number): Observable<EventoCalendarYearMont[]> {
  return this.http.get<EventoCalendarYearMont[]>(`${this._apiUrl}GetEventosCalendario?year=${year}&month=${month}`);
}


} // END CLASS