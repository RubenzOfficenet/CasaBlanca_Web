import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CalendarEvent } from '../calendar-casa-blanca';


@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private http = inject(HttpClient);
  private apiUrl = '/api/eventos'; // Ajustar con el endpoint correspondiente

  // getEventos(): Observable<CalendarEvent[]> {
  //   return this.http.get<CalendarEvent[]>(this.apiUrl);
  // }

getEventos(): Observable<CalendarEvent[]> {
    // -------------------------------------------------------------------------
    // Llamado real al Web API comentada temporalmente:
    // return this.http.get<CalendarEvent[]>(this.apiUrl);
    // -------------------------------------------------------------------------

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const nowIso = today.toISOString();

    // Datos Mock de prueba
    const mockEvents: CalendarEvent[] = [
      {
        id: 'mock-101',
        NombreEvento: 'Asamblea General de Vecinos',
        FehaInicio: `${yyyy}-${mm}-${dd}T09:00:00`,
        FechaFiin: `${yyyy}-${mm}-${dd}T11:00:00`,
        IdUbicaccion: 1,
        IdInmueble: 101,
        imagenEvento: '',
        DateAdded: nowIso,
        DateUpdated: nowIso,
        sectionName: 'Sección I',
        houseName: '1-A',
        personName: 'Juan',
        color: '#4f46e5'
      },
      {
        id: 'mock-102',
        NombreEvento: 'Mantenimiento de Áreas Verdes',
        FehaInicio: `${yyyy}-${mm}-${dd}T12:00:00`,
        FechaFiin: `${yyyy}-${mm}-${dd}T14:30:00`,
        IdUbicaccion: 1,
        IdInmueble: 103,
        imagenEvento: '',
        DateAdded: nowIso,
        DateUpdated: nowIso,
        sectionName: 'Sección I',
        houseName: '3-C',
        personName: 'Maria',
        color: '#059669'
      },
      {
        id: 'mock-103',
        NombreEvento: 'Revisión de Seguridad y Alumbrado',
        FehaInicio: `2026-11-04T16:00:00`,
        FechaFiin: `2026-11-04T17:30:00`,
        IdUbicaccion: 2,
        IdInmueble: 201,
        imagenEvento: '',
        DateAdded: nowIso,
        DateUpdated: nowIso,
        sectionName: 'Sección II',
        houseName: '16-A',
        personName: 'Martha',
        color: '#d97706'
      }
    ];

    // Retorna los datos mock como un Observable simulando la respuesta HTTP
    return of(mockEvents);
  }

  createEvento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.apiUrl, evento);
  }

  updateEvento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/${evento.id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
