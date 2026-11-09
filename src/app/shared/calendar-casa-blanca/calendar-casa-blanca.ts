import { Component, signal, computed, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SectionOption {
  id: number;
  name: string;
}

export interface CasaOption {
  id: number;
  sectionId: number;
  name: string;
  nombre: string;
}

export interface CalendarEvent {
  id: string;
  NombreEvento: string;
  FehaInicio: string; // Formato YYYY-MM-DDTHH:mm
  FechaFiin: string;
  IdUbicaccion: number;
  IdInmueble: number;
  imagenEvento?: string;
  DateAdded?: string;
  DateUpdated?: string;

  // Propiedades auxiliares de presentación UI
  sectionName?: string;
  houseName?: string;
  personName?: string;
  color?: string;
}

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-casa-blanca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './calendar-casa-blanca.html',
  styleUrl: './calendar-casa-blanca.css'
})
export class CalendarCasaBlanca {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // ----------------------------------------------------
  // ENTRADAS DESDE EL COMPONENTE PADRE (Inputs)
  // ----------------------------------------------------
  /** Años configurables enviables desde el padre */
  yearsListInput = input<number[]>(
    Array.from({ length: 12 }, (_, i) => 2020 + i),
    { alias: 'yearsList' }
  );

  /** Eventos cargados dinámicamente desde el padre */
  eventsInput = input<CalendarEvent[]>([], { alias: 'events' });

  // ----------------------------------------------------
  // SALIDAS HACIA EL COMPONENTE PADRE (Outputs)
  // ----------------------------------------------------
  eventCreated = output<CalendarEvent>();
  eventUpdated = output<CalendarEvent>();
  eventDeleted = output<string>();

  readonly daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  showDeleteModal = signal<boolean>(false);
  eventToDelete = signal<CalendarEvent | null>(null);

  currentDate = signal<Date>(new Date());
  showModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingEventId = signal<string | null>(null);
  selectedDayDate = signal<string>('');

  sections = signal<SectionOption[]>([
    { id: 1, name: 'Sección I' },
    { id: 2, name: 'Sección II' }
  ]);

  casas = signal<CasaOption[]>([
    { id: 101, sectionId: 1, name: '1-A', nombre: 'Juan' },
    { id: 102, sectionId: 1, name: '2-B', nombre: 'Pedro' },
    { id: 103, sectionId: 1, name: '3-C', nombre: 'Maria' },
    { id: 104, sectionId: 1, name: '4-H', nombre: 'Jose' },
    { id: 201, sectionId: 2, name: '16-A', nombre: 'Martha' },
    { id: 202, sectionId: 2, name: '44-C', nombre: 'Carlos' },
    { id: 203, sectionId: 2, name: '22-A', nombre: 'Ana' }
  ]);

  availableHouses = signal<CasaOption[]>([]);
  storedEvents = signal<CalendarEvent[]>([]);

  // Garantiza que la lista de años contenga el año seleccionado actualmente
  yearsList = computed(() => {
    const list = [...this.yearsListInput()];
    const currentYear = this.currentDate().getFullYear();
    if (!list.includes(currentYear)) {
      list.push(currentYear);
      list.sort((a, b) => a - b);
    }
    return list;
  });

  eventForm: FormGroup = this.fb.group({
    NombreEvento: ['', Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['10:00', Validators.required],
    IdUbicaccion: ['', Validators.required],
    IdInmueble: ['', Validators.required],
    imagenEvento: ['']
  });

  constructor() {
    effect(() => {
      const incomingEvents = this.eventsInput();
      if (incomingEvents) {
        this.storedEvents.set(incomingEvents);
      }
    });
  }

  requestDeleteEvent(event: CalendarEvent, mouseEvent: MouseEvent): void {
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

    this.storedEvents.update(prev => prev.filter(e => e.id !== event.id));
    this.eventDeleted.emit(event.id);

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

  currentMonthYearTitle = computed(() => {
    const date = this.currentDate();
    const month = this.monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  });

  activeWeekNumber = computed(() => {
    const date = this.currentDate();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  });

  // Corregido: sintaxis de string limpia
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

  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newYear = parseInt(select.value, 10);
    const current = this.currentDate();
    this.currentDate.set(new Date(newYear, current.getMonth(), 1));
  }

  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newMonth = parseInt(select.value, 10);
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

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  onRightClick(event: MouseEvent, day: CalendarDay): void {
    event.preventDefault();
    this.isEditMode.set(false);
    this.editingEventId.set(null);
    this.selectedDayDate.set(day.dateString);
    this.eventForm.reset({
      NombreEvento: '',
      startTime: '09:00',
      endTime: '10:00',
      IdUbicaccion: '',
      IdInmueble: '',
      imagenEvento: ''
    });
    this.availableHouses.set([]);
    this.showModal.set(true);
  }

  // onEventClick(event: CalendarEvent, mouseEvent: MouseEvent): void {
  //   mouseEvent.stopPropagation();
  //   this.isEditMode.set(true);
  //   this.editingEventId.set(event.id);

  //   const eventDateStr = event.FehaInicio.split('T')[0] || event.FehaInicio;
  //   this.selectedDayDate.set(eventDateStr);

  //   const housesForSection = this.casas().filter(c => c.sectionId === event.IdUbicaccion);
  //   this.availableHouses.set(housesForSection);

  //   const startTimeStr = this.extractTimeFromDateStr(event.FehaInicio) || '09:00';
  //   const endTimeStr = this.extractTimeFromDateStr(event.FechaFiin) || '10:00';

  //   this.eventForm.patchValue({
  //     NombreEvento: event.NombreEvento,
  //     startTime: startTimeStr,
  //     endTime: endTimeStr,
  //     IdUbicaccion: event.IdUbicaccion,
  //     IdInmueble: event.IdInmueble,
  //     imagenEvento: event.imagenEvento || ''
  //   });

  //   this.showModal.set(true);
  // }


  onEventClick(event: CalendarEvent, mouseEvent: MouseEvent): void {
  mouseEvent.stopPropagation();
  this.isEditMode.set(true);
  this.editingEventId.set(event.id);

  const eventDateStr = event.FehaInicio.split('T')[0] || event.FehaInicio;
  this.selectedDayDate.set(eventDateStr);

  const housesForSection = this.casas().filter(c => c.sectionId === event.IdUbicaccion);
  this.availableHouses.set(housesForSection);

  // 1. Extraemos la hora en formato 24h (HH:mm) que entiende el <input type="time">
  const startTimeStr = this.extractRawTime24h(event.FehaInicio);
  const endTimeStr = this.extractRawTime24h(event.FechaFiin);

  // 2. Parcheamos el formulario con las horas en 24h
  this.eventForm.patchValue({
    NombreEvento: event.NombreEvento,
    startTime: startTimeStr,
    endTime: endTimeStr,
    IdUbicaccion: event.IdUbicaccion,
    IdInmueble: event.IdInmueble,
    imagenEvento: event.imagenEvento || ''
  });

  this.showModal.set(true);
}




  onSectionChange(): void {
    const selectedSectionId = Number(this.eventForm.get('IdUbicaccion')?.value);
    const housesForSection = this.casas().filter(c => c.sectionId === selectedSectionId);

    if (housesForSection.length > 0) {
      this.availableHouses.set(housesForSection);
      this.eventForm.patchValue({ IdInmueble: '' });
    } else {
      this.availableHouses.set([]);
    }
  }

  requestSaveConfirmation(): void {
    if (this.eventForm.invalid) return;
    this.showConfirmModal.set(true);
  }

  cancelSaveConfirmation(): void {
    this.showConfirmModal.set(false);
  }

  confirmSaveEvent(): void {
    const formValues = this.eventForm.value;
    const locationId = Number(formValues.IdUbicaccion);
    const inmuebleId = Number(formValues.IdInmueble);

    const sectionObj = this.sections().find(s => s.id === locationId);
    const houseObj = this.casas().find(c => c.id === inmuebleId);

    const fullStartDate = `${this.selectedDayDate()}T${formValues.startTime}:00`;
    const fullEndDate = `${this.selectedDayDate()}T${formValues.endTime}:00`;
    const nowIso = new Date().toISOString();

    if (this.isEditMode() && this.editingEventId()) {
      let updatedEvent: CalendarEvent | null = null;

      this.storedEvents.update(prev => prev.map(e => {
        if (e.id === this.editingEventId()) {
          updatedEvent = {
            ...e,
            NombreEvento: formValues.NombreEvento,
            FehaInicio: fullStartDate,
            FechaFiin: fullEndDate,
            IdUbicaccion: locationId,
            IdInmueble: inmuebleId,
            imagenEvento: formValues.imagenEvento || '',
            DateUpdated: nowIso,
            sectionName: sectionObj?.name || '',
            houseName: houseObj?.name || '',
            personName: houseObj?.nombre || ''
          };
          return updatedEvent;
        }
        return e;
      }));

      if (updatedEvent) {
        this.eventUpdated.emit(updatedEvent);
      }
    } else {
      const colors = ['#4f46e5', '#059669', '#d97706', '#db2777', '#7c3aed'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newEvent: CalendarEvent = {
        id: 'evt-' + Date.now(),
        NombreEvento: formValues.NombreEvento,
        FehaInicio: fullStartDate,
        FechaFiin: fullEndDate,
        IdUbicaccion: locationId,
        IdInmueble: inmuebleId,
        imagenEvento: formValues.imagenEvento || '',
        DateAdded: nowIso,
        DateUpdated: nowIso,
        sectionName: sectionObj?.name || '',
        houseName: houseObj?.name || '',
        personName: houseObj?.nombre || '',
        color: randomColor
      };

      this.storedEvents.update(prev => [...prev, newEvent]);
      this.eventCreated.emit(newEvent);
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

  private filterEventsForDate(dateStr: string): CalendarEvent[] {
    return this.storedEvents().filter(e => {
      const startDateStr = e.FehaInicio.split('T')[0] || e.FehaInicio;
      return startDateStr === dateStr;
    });
  }

  // extractTimeFromDateStr(dateStr: string): string {
  //   if (!dateStr) return '';
  //   if (dateStr.includes('T')) {
  //     return dateStr.split('T')[1].substring(0, 5);
  //   }
  //   return dateStr;
  // }

extractTimeFromDateStr(dateStr: string): string {
  if (!dateStr) return '';

  let timePart = dateStr;

  // Si viene en formato ISO (ej. "2026-10-15T14:30:00"), extraemos la parte de la hora "14:30"
  if (dateStr.includes('T')) {
    timePart = dateStr.split('T')[1].substring(0, 5);
  }

  // Dividimos horas y minutos
  const parts = timePart.split(':');
  if (parts.length < 2) return dateStr; // Retorna el valor original si no cumple formato de hora

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return dateStr;

  // Determinamos si es AM o PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convertimos de formato 24h a 12h
  hours = hours % 12;
  if (hours === 0) hours = 12; // Las 00:00 representan las 12 AM y las 12:00 las 12 PM

  // Formateamos la hora para mantener dos dígitos si lo prefieres (ej. 09:30 AM o 9:30 AM)
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;

  return `${formattedHours}:${minutes} ${period}`;
}

private extractRawTime24h(dateStr: string): string {
  if (!dateStr) return '09:00';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[1].substring(0, 5);
  }
  return dateStr.substring(0, 5);
}


}