import { Component, signal, computed, inject, input, output, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { EventosService } from './services/eventos-service';

import { EstatusOption } from './interfaces/EstatusOption.interace';
import { SectionOption } from './interfaces/SectionOption.interface';
import { CasaOption } from './interfaces/CasaOption.interface';
import { CalendarDay } from './interfaces/CalendarDay.interface';
import { EventoCalendarYearMont } from './interfaces/EventoCalendarYearMont.interface';

import { DAYS_OF_WEEK, MONTH_NAMES, MY_DATE_FORMATS } from '../../Constants/app.constants';
import { Ubicacion } from '../../pages/eventos/Model/ubicacion.interface';
import { EventosingresoService } from '../../pages/eventos/services/eventosingresoService';
import { InmueblesServices } from '../../pages/inmuebles/services/inmuebles-services';
import { CasasList } from './interfaces/ICasasList.interfgace';

@Component({
  selector: 'app-calendar-casa-blanca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './calendar-casa-blanca.html',
  styleUrl: './calendar-casa-blanca.css'
})
export class CalendarCasaBlanca implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private eventosService = inject(EventosService);
  private readonly catalogosService = inject(EventosingresoService);
  private readonly inmueblesServices = inject(InmueblesServices);

  ubicacionList: Ubicacion[] = [];

  // Inputs opcionales
  casasPadreInput = input<CasaOption[]>([], { alias: 'casasPadre' });
  yearsListInput = input<number[]>(
    Array.from({ length: 12 }, (_, i) => 2020 + i), { alias: 'yearsList' }
  );
  eventsInput = input<EventoCalendarYearMont[]>([], { alias: 'events' });

  // Outputs opcionales
  eventCreated = output<EventoCalendarYearMont>();
  eventUpdated = output<EventoCalendarYearMont>();
  eventDeleted = output<number>();

  // Signals de estado y catálogos
  secciones = signal<SectionOption[]>([]);
  casasList = signal<CasasList[]>([]);
  casas = signal<EventoCalendarYearMont[]>([]);
  misEventosDesdeApi = signal<EventoCalendarYearMont[]>([]);
  selectedSectionId = signal<number | null>(null);

  estatusOptions = signal<EstatusOption[]>([
    { id: 1, nombre: 'Apartado' },
    { id: 2, nombre: 'Liquidado' },
    { id: 3, nombre: 'Cancelado' }
  ]);

  // Modales y control de UI
  showModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  eventToDelete = signal<EventoCalendarYearMont | null>(null);

  isEditMode = signal<boolean>(false);
  editingEventId = signal<number | null>(null);
  selectedDayDate = signal<string>('');
  currentDate = signal<Date>(new Date());

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly monthNames = MONTH_NAMES;

  // Signal computada: casas filtradas por la sección seleccionada
  availableHouses = computed(() => {
    const secId = Number(this.selectedSectionId());
    const todasLasCasas = this.casasList();

    if (!secId || !todasLasCasas.length) return [];

    return todasLasCasas.filter((c: any) => {
      const rawSecId =
        c.sectionId ??
        c.idSeccion ??
        c.seccionId ??
        c.IdSeccion ??
        c.SectionId ??
        c.SeccionId ??
        c.seccion?.id;

      return rawSecId === undefined || Number(rawSecId) === secId;
    });
  });

  yearsList = computed(() => {
    const list = [...this.yearsListInput()];
    const currentYear = this.currentDate().getFullYear();
    if (!list.includes(currentYear)) {
      list.push(currentYear);
      list.sort((a, b) => a - b);
    }
    return list;
  });

  eventoForm: FormGroup = this.fb.nonNullable.group({
    idSeccion: [0, [Validators.required, Validators.min(1)]],
    idInmueble: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
    idEstatusEvento: [0, [Validators.required, Validators.min(1)]],
    fechaEvento: [new Date(), [Validators.required]],
    reciboNumero: ['', [Validators.required, Validators.maxLength(50)]],
    fechaPago: [new Date(), [Validators.required]],
    apartado: [0, [Validators.required, Validators.min(0)]],
    liquida: [0, [Validators.required, Validators.min(0)]],
    luz: [0, [Validators.min(0)]],
    depositoGarantia: [0, [Validators.min(0)]],
    limpiezaDomingo: [0, [Validators.min(0)]],
    rentaInmobiliario: [0, [Validators.min(0)]],
    comentarios: ['']
  });

  constructor() {
    effect(() => {
      const inputCasas = this.casasPadreInput();
      if (Array.isArray(inputCasas) && inputCasas.length > 0 && this.casasList().length === 0) {
        this.casasList.set(inputCasas as unknown as CasasList[]);
      }
    });

    effect(() => {
      const inputEvts = this.eventsInput();
      if (Array.isArray(inputEvts) && inputEvts.length > 0 && this.misEventosDesdeApi().length === 0) {
        this.misEventosDesdeApi.set(inputEvts);
      }
    });

    effect(() => {
      const fecha = this.currentDate();
      this.cargarEventos(fecha.getFullYear(), fecha.getMonth() + 1);
    });

    this.eventoForm.get('idSeccion')?.valueChanges.subscribe(value => {
      const sectionId = Number(value);
      const isValid = !isNaN(sectionId) && sectionId > 0;

      this.selectedSectionId.set(isValid ? sectionId : null);

      const inmuebleCtrl = this.eventoForm.get('idInmueble');
      inmuebleCtrl?.setValue(0, { emitEvent: false });
      inmuebleCtrl?.disable({ emitEvent: false });
debugger;
      if (isValid) {
        this.getCasas(sectionId);
      } else {
        this.casasList.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.cargarSecciones();
  }

  cargarSecciones(): void {
    this.catalogosService.leeSecciones().subscribe({
      next: (res: any) => {
        this.ubicacionList = Array.isArray(res)
          ? res
          : (res?.data ?? res?.result ?? []);
      },
      error: (err) => {
        console.error('Error al cargar las ubicaciones:', err);
      }
    });
  }

  getCasas(sectionId: number): void {
    this.eventosService.getCasas(sectionId).subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
        debugger;
        this.casasList.set(lista);

        const inmuebleCtrl = this.eventoForm.get('idInmueble');
        if (lista.length > 0) {
          inmuebleCtrl?.enable({ emitEvent: false });
        } else {
          inmuebleCtrl?.disable({ emitEvent: false });
        }
      },
      error: (err: any) => {
        console.error('Error al cargar casas:', err);
        this.casasList.set([]);
        this.eventoForm.get('idInmueble')?.disable({ emitEvent: false });
      }
    });
  }

  cargarEventos(year: number, month: number): void {
    this.eventosService.getCalendarEventsByYearMonth(year, month).subscribe({
      next: (EventoCalendar: any) => {
        const lista = Array.isArray(EventoCalendar)
          ? EventoCalendar
          : (EventoCalendar?.data ?? EventoCalendar?.result ?? []);
        this.misEventosDesdeApi.set(lista);
      },
      error: (err) => console.error('Error al cargar eventos:', err)
    });
  }

  onEventCreated(nuevoEvento: EventoCalendarYearMont): void {
    this.misEventosDesdeApi.update(lista => [...lista, nuevoEvento]);
    this.eventCreated.emit(nuevoEvento);
  }

  onEventUpdated(eventoEditado: EventoCalendarYearMont): void {
    this.misEventosDesdeApi.update(lista =>
      lista.map(e => e.id === eventoEditado.id ? eventoEditado : e)
    );
    this.eventUpdated.emit(eventoEditado);
  }

  onEventDeleted(eventId: number): void {
    this.misEventosDesdeApi.update(lista =>
      lista.filter(e => e.id !== eventId)
    );
    this.eventDeleted.emit(eventId);
  }

  private extractSectionId(houseObj: any): number {
    if (!houseObj) return 0;
    const rawSecId =
      houseObj.sectionId ??
      houseObj.idSeccion ??
      houseObj.seccionId ??
      houseObj.IdSeccion ??
      houseObj.SectionId ??
      houseObj.SeccionId ??
      houseObj.seccion?.id ??
      0;
    return Number(rawSecId) || 0;
  }

  private toDateString(value: any): string {
    if (!value) return '';
    if (value instanceof Date) {
      return this.formatDate(value);
    }
    return String(value).split('T')[0];
  }

  private parseToDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    const cleanStr = String(value).split('T')[0];
    const [year, month, day] = cleanStr.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : new Date(value);
  }

  requestDeleteEvent(event: EventoCalendarYearMont, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.eventToDelete.set(event);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.eventToDelete.set(null);
  }

  confirmDeleteEvent(): void {
    const event = this.eventToDelete();
    if (!event) return;

    this.onEventDeleted(event.id);

    this.snackBar.open('Evento eliminado exitosamente', 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });

    this.cancelDelete();
  }

  selectedDateTitle = computed(() => {
    const date = this.currentDate();
    const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    const dayNumber = date.getDate();
    const month = this.monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${dayNumber} de ${month} de ${year}`;
  });

  activeWeekNumber = computed(() => {
    const date = this.currentDate();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  activeWeekRange = computed(() => {
    const curr = new Date(this.currentDate());
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;

    const firstDay = new Date(curr.setDate(first));
    const lastDay = new Date(curr.setDate(last));

    const fMonth = this.monthNames[firstDay.getMonth()].substring(0, 3);
    const lMonth = this.monthNames[lastDay.getMonth()].substring(0, 3);

    return `${firstDay.getDate()} ${fMonth} - ${lastDay.getDate()} ${lMonth}`;
  });

  onYearChange(event: Event | number): void {
    const newYear = typeof event === 'number' ? event : parseInt((event.target as HTMLSelectElement).value, 10);
    const current = this.currentDate();
    this.currentDate.set(new Date(newYear, current.getMonth(), 1));
  }

  onMonthChange(event: Event | number): void {
    const newMonth = typeof event === 'number' ? event : parseInt((event.target as HTMLSelectElement).value, 10);
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), newMonth, 1));
  }

  calendarDays = computed(() => {
    const activeDate = this.currentDate();
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayStr = this.formatDate(new Date());
    const days: CalendarDay[] = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDate = new Date(year, month - 1, prevMonthLastDate - i);
      const dateStr = this.formatDate(pDate);
      days.push({
        date: pDate,
        dateString: dateStr,
        dayNumber: pDate.getDate(),
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.filterEventsForDate(dateStr)
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(year, month, d);
      const dateStr = this.formatDate(cDate);
      days.push({
        date: cDate,
        dateString: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: this.filterEventsForDate(dateStr)
      });
    }

    const remainingDays = 42 - days.length;
    for (let n = 1; n <= remainingDays; n++) {
      const nDate = new Date(year, month + 1, n);
      const dateStr = this.formatDate(nDate);
      days.push({
        date: nDate,
        dateString: dateStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: this.filterEventsForDate(dateStr)
      });
    }

    return days;
  });

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  onRightClick(event: MouseEvent, day: CalendarDay): void {
    event.preventDefault();
    this.isEditMode.set(false);
    this.editingEventId.set(null);
    this.selectedDayDate.set(day.dateString);

    const targetDate = day.dateString ? this.parseToDate(day.dateString) : new Date();

    this.selectedSectionId.set(null);
    this.casasList.set([]);

    this.eventoForm.reset({
      idSeccion: 0,
      idInmueble: 0,
      idEstatusEvento: 1,
      fechaEvento: targetDate,
      reciboNumero: '',
      fechaPago: new Date(),
      apartado: 0,
      liquida: 0,
      luz: 0,
      depositoGarantia: 0,
      limpiezaDomingo: 0,
      rentaInmobiliario: 0,
      comentarios: ''
    }, { emitEvent: false });

    this.eventoForm.get('idInmueble')?.disable({ emitEvent: false });
    this.showModal.set(true);
  }

  onEventClick(event: EventoCalendarYearMont, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.isEditMode.set(true);
    this.editingEventId.set(event.id);

    const eventDateStr = this.toDateString(event.fechaEvento);
    this.selectedDayDate.set(eventDateStr);

    const houseObj = this.casasList().find(c => Number(c.id) === Number(event.idInmueble));
    const sectionId = Number(event.idUbicacion) || this.extractSectionId(houseObj);

    this.selectedSectionId.set(sectionId > 0 ? sectionId : null);

    if (sectionId > 0) {
      this.getCasas(sectionId);
    }

    this.eventoForm.patchValue({
      idSeccion: sectionId,
      idInmueble: Number(event.idInmueble),
      idEstatusEvento: Number(event.idEstatusEvento),
      fechaEvento: this.parseToDate(event.fechaEvento),
      reciboNumero: event.reciboNumero,
      fechaPago: this.parseToDate(event.fechaPago),
      apartado: event.apartado,
      liquida: event.liquida,
      luz: event.luz || 0,
      depositoGarantia: event.depositoGarantia || 0,
      limpiezaDomingo: event.limpiezaDomingo || 0,
      rentaInmobiliario: event.rentaInmobiliario || 0,
      comentarios: event.comentarios || ''
    }, { emitEvent: false });

    this.showModal.set(true);
  }

  requestSaveConfirmation(): void {
    if (this.eventoForm.invalid) return;
    this.showConfirmModal.set(true);
  }

  cancelSaveConfirmation(): void {
    this.showConfirmModal.set(false);
  }

  confirmSaveEvent(): void {
    if (this.eventoForm.invalid) return;

    const formValues = this.eventoForm.getRawValue();
    const inmuebleId = Number(formValues.idInmueble);
    const seccionId = Number(formValues.idSeccion);
    const estatusId = Number(formValues.idEstatusEvento);

    const houseObj = this.casas().find(c => Number(c.id) === inmuebleId);
    const ubicacionObj = this.ubicacionList.find(u => Number(u.id) === seccionId);
    const estatusObj = this.estatusOptions().find(e => Number(e.id) === estatusId);

    const fechaEventoStr = this.toDateString(formValues.fechaEvento);
    const fechaPagoStr = this.toDateString(formValues.fechaPago);

    if (this.isEditMode() && this.editingEventId() !== null) {
      const existingEvent = this.misEventosDesdeApi().find(e => e.id === this.editingEventId());
      if (existingEvent) {
        const updatedEvent: EventoCalendarYearMont = {
          ...existingEvent,
          idInmueble: inmuebleId,
          idEstatusEvento: estatusId,
          estatusEvento: estatusObj?.nombre || existingEvent.estatusEvento,
          fechaEvento: fechaEventoStr,
          reciboNumero: String(formValues.reciboNumero || ''),
          fechaPago: fechaPagoStr,
          apartado: Number(formValues.apartado || 0),
          liquida: Number(formValues.liquida || 0),
          luz: Number(formValues.luz || 0),
          depositoGarantia: Number(formValues.depositoGarantia || 0),
          limpiezaDomingo: Number(formValues.limpiezaDomingo || 0),
          rentaInmobiliario: Number(formValues.rentaInmobiliario || 0),
          comentarios: formValues.comentarios || '',
          numeroCasa: houseObj?.numeroCasa || existingEvent.numeroCasa,
          idUbicacion: seccionId || existingEvent.idUbicacion,
          nombreUbicacion: ubicacionObj?.nombreUbicacion || existingEvent.nombreUbicacion,
          nombre: houseObj?.nombre ?? existingEvent.nombre
        };

        this.onEventUpdated(updatedEvent);
      }
    } else {
      const newEvent: EventoCalendarYearMont = {
        id: Date.now(),
        idInmueble: inmuebleId,
        idEstatusEvento: estatusId,
        estatusEvento: estatusObj?.nombre || '',
        fechaEvento: fechaEventoStr,
        reciboNumero: String(formValues.reciboNumero || ''),
        fechaPago: fechaPagoStr,
        apartado: Number(formValues.apartado || 0),
        liquida: Number(formValues.liquida || 0),
        luz: Number(formValues.luz || 0),
        depositoGarantia: Number(formValues.depositoGarantia || 0),
        limpiezaDomingo: Number(formValues.limpiezaDomingo || 0),
        rentaInmobiliario: Number(formValues.rentaInmobiliario || 0),
        comentarios: formValues.comentarios || '',
        idCasa: inmuebleId,
        numeroCasa: houseObj?.numeroCasa || '',
        idUbicacion: seccionId,
        nombreUbicacion: ubicacionObj?.nombreUbicacion || '',
        borrado: false,
        nombre: houseObj?.nombre || null,
        apellidos: null
      };

      this.onEventCreated(newEvent);
    }

    this.snackBar.open('El evento se ha guardado con éxito', 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });

    this.closeModal();
  }

  closeModal(): void {
    this.showConfirmModal.set(false);
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingEventId.set(null);
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private filterEventsForDate(dateStr: string): EventoCalendarYearMont[] {
    return this.misEventosDesdeApi().filter(e => {
      const startDateStr = this.toDateString(e.fechaEvento);
      return startDateStr === dateStr;
    });
  }

  extractTimeFromDateStr(dateStr: string): string {
    if (!dateStr) return '';
    let timePart = dateStr;
    if (dateStr.includes('T')) {
      timePart = dateStr.split('T')[1].substring(0, 5);
    }
    const parts = timePart.split(':');
    if (parts.length < 2) return dateStr;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return dateStr;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${minutes} ${period}`;
  }
}