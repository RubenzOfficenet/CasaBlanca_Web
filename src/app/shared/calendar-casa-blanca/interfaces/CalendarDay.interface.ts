
import { EventoCalendarYearMont } from './EventoCalendarYearMont.interface';

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EventoCalendarYearMont[];
}