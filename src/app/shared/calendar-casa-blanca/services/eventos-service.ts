import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


import { CalendarEvent  } from '../interfaces/CalendarEvent.interface';
import { CasaOption     } from '../interfaces/CasaOption.interface';
import { SectionOption  } from '../interfaces/SectionOption.interface';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private http = inject(HttpClient);
  private apiUrl = '/api/eventos'; // Ajustar con el endpoint correspondiente

  Evento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.apiUrl, evento);
  }

  updateEvento(evento: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/${evento.id}`, evento);
  }

  deleteEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener la lista de casas
  getCasas(sectionId?: number): Observable<CasaOption[]> {
    // -------------------------------------------------------------------------
    // Llamado real al Web API con HttpParams (descomentar al conectar backend):
    // const options = sectionId ? { params: new HttpParams().set('sectionId', sectionId) } : {};
    // return this.http.get<CasaOption[]>(this.apiCasasUrl, options);
    // -------------------------------------------------------------------------

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

  getEventos(): Observable<CalendarEvent[]> {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'evt-101',
        idInmueble: 101,
        idEstatusEvento: 1,
        fechaEvento: '2026-11-15',
        reciboNumero: '1001',
        fechaPago: '2026-11-01',
        apartado: 1500.00,
        liquida: 3500.00,
        luz: 250.00,
        depositoGarantia: 1000.00,
        limpiezaDomingo: 200.00,
        rentaInmobiliario: 0.00,
        comentarios: 'Apartado realizado para evento familiar. Pendiente saldo de liquidación.',
        houseName: 'Casa 1-A',
        personName: 'Juan Pérez',
        color: '#4f46e5'
      },
      {
        id: 'evt-102',
        idInmueble: 102,
        idEstatusEvento: 2,
        fechaEvento: '2026-11-18',
        reciboNumero: '1002',
        fechaPago: '2026-11-05',
        apartado: 2000.00,
        liquida: 0.00,
        luz: 300.00,
        depositoGarantia: 1500.00,
        limpiezaDomingo: 200.00,
        rentaInmobiliario: 500.00,
        comentarios: 'Pago completo recibido. Incluye renta de mobiliario adicional.',
        houseName: 'Casa 2-B',
        personName: 'Pedro Gómez',
        color: '#059669'
      },
      {
        id: 'evt-103',
        idInmueble: 103,
        idEstatusEvento: 1,
        fechaEvento: '2026-11-22',
        reciboNumero: '1003',
        fechaPago: '2026-11-08',
        apartado: 1000.00,
        liquida: 4000.00,
        luz: 0.00,
        depositoGarantia: 1000.00,
        limpiezaDomingo: 200.00,
        rentaInmobiliario: 0.00,
        comentarios: 'Cliente solicita confirmación de limpieza de domingo.',
        houseName: 'Casa 3-C',
        personName: 'María López',
        color: '#d97706'
      },
      {
        id: 'evt-104',
        idInmueble: 201,
        idEstatusEvento: 3,
        fechaEvento: '2026-11-25',
        reciboNumero: '1004',
        fechaPago: '2026-11-02',
        apartado: 500.00,
        liquida: 0.00,
        luz: 0.00,
        depositoGarantia: 0.00,
        limpiezaDomingo: 0.00,
        rentaInmobiliario: 0.00,
        comentarios: 'Evento cancelado por el cliente. Devolución de depósito no aplicable.',
        houseName: 'Casa 16-A',
        personName: 'Martha Sánchez',
        color: '#db2777'
      },
      {
        id: 'evt-105',
        idInmueble: 202,
        idEstatusEvento: 2,
        fechaEvento: '2026-11-28',
        reciboNumero: '1005',
        fechaPago: '2026-11-09',
        apartado: 2500.00,
        liquida: 0.00,
        luz: 400.00,
        depositoGarantia: 2000.00,
        limpiezaDomingo: 250.00,
        rentaInmobiliario: 800.00,
        comentarios: 'Reserva para fin de año liquidad con depósito de garantía completo.',
        houseName: 'Casa 44-C',
        personName: 'Carlos Ramírez',
        color: '#7c3aed'
      }
    ];

    return of(mockEvents);
  }
}