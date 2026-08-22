import { Component, inject, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../../Constants/app.constants';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { IEventoIngreso } from '../Model/Evento.model';
import { EventosingresoService } from '../services/eventosingresoService';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Nuevoevento } from '../nuevoevento/nuevoevento';
import { forkJoin } from 'rxjs';
import { Editaringresoevento } from '../editaringresoevento/editaringresoevento';

@Component({
  selector: 'app-eventosingresos',
  imports: [CurrencyPipe, DatePipe, CommonModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule],
  templateUrl: './eventosingresos.html',
  styleUrl: './eventosingresos.css',
})
export class Eventosingresos implements OnInit {

  private readonly dialog = inject(MatDialog);
  private readonly catalogosService = inject(EventosingresoService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  gastoConsolidado: number = 0;
  fechaActual = new Date();

  yearList = Object.entries(YEAR_CONSTATS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));

  monthList = Object.entries(MONTH_CONSTANTS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));

  anioSeleccionado: number = this.yearList[0].value;
  mesActual: number = new Date().getMonth() + 1;

  isLoading: boolean = true;
  eliminandoIds = new Set<number>();

  dataSource = new MatTableDataSource<IEventoIngreso>();
  displayedColumns: string[] = [
    'nombreUbicacion',
    'numeroCasa',
    'fechaEvento',
    'nombreTitular',
    'reciboNumero',
    'fechaPago',
    'apartado',
    'liquida',
    'luz',
    'depositoGarantia',
    'limpiezaDomingo',
    'rentaInmobiliario',
    'total',
    'estatusEvento',
    'acciones'];


  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly eventosingresoService = inject(EventosingresoService);

  constructor() { }
ngOnInit(): void {
    // Configuración del predicado para filtrar por todos los campos de displayedColumns
    this.dataSource.filterPredicate = (data: IEventoIngreso, filter: string): boolean => {
      const searchStr = filter.trim().toLowerCase();

      // Recorremos las columnas de la tabla (excluyendo 'acciones')
      return this.displayedColumns
        .filter(col => col !== 'acciones')
        .some(columnKey => {
          const val = (data as Record<string, any>)[columnKey];

          if (val === null || val === undefined) {
            return false;
          }

          // Si es una fecha, convertimos a string/ISO
          if (val instanceof Date) {
            return val.toISOString().toLowerCase().includes(searchStr);
          }

          // Para números, strings u otros tipos
          return val.toString().toLowerCase().includes(searchStr);
        });
    };

    this.leeDatos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  abrirPopup(): void {
    forkJoin({
      ubicaciones: this.catalogosService.leeSecciones(),
      estatus: this.catalogosService.leeEstatusEvento()
    }).subscribe({
      next: ({ ubicaciones, estatus }) => {

        if (!ubicaciones?.length || !estatus?.length) {
          this.snackBar.open(
            'No se encontraron catálogos disponibles. Verifica la configuración.',
            'Cerrar',
            { duration: 4000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          );
          return; // no abre el diálogo si falta algún catálogo
        }

        const dialogRef = this.dialog.open(Nuevoevento, {
          width: '40vw',
          maxWidth: '2000px',
          minWidth: '320px',
          disableClose: false,
          hasBackdrop: true,
          data: { ubicaciones, estatus }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.cargarEgresos();
          }
        });
      },
      error: () => {
        this.snackBar.open(
          'Error al cargar los catálogos. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cambiaAnio(anioSeleccionado: number): void {
    this.leeDatos();
  }

  cambiaMes(mesSeleccionado: number): void {
    this.leeDatos();
  }

  leeDatos(): void {
    this.cargarEgresos();
  }

  cargarEgresos(): void {
    this.isLoading = true;
    const indiceYear: number = Number(this.anioSeleccionado);
    const year: number = YEAR_CONSTATS[indiceYear];
    const mont: number = Number(this.mesActual);

    this.eventosingresoService.leeEventoIngresos(year, mont).subscribe({
      next: (response: IEventoIngreso[]) => {

        console.log('Datos de egresos obtenidos:', response);

        this.dataSource.data = response;
        this.isLoading = false;
        this.cdr.markForCheck();

      },
      error: (error) => {
        console.error('Error al obtener los egresos', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  editarIngreso(id: number): void {
    this.editarEgreso(id);
  }

  borrarIngreso(id: number): void {
    this.borrarIngresoEvento(id);
  }

  editarEgreso(id: number): void {
    forkJoin({
      ubicaciones: this.catalogosService.leeSecciones(),
      estatus: this.catalogosService.leeEstatusEvento()
    }).subscribe({
      next: ({ ubicaciones, estatus }) => {

        if (!ubicaciones?.length || !estatus?.length) {
          this.snackBar.open(
            'No se encontraron catálogos disponibles. Verifica la configuración.',
            'Cerrar',
            { duration: 4000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          );
          return; // no abre el diálogo si falta algún catálogo
        }

        const dialogRef = this.dialog.open(Editaringresoevento, {
          width: '40vw',
          maxWidth: '2000px',
          minWidth: '320px',
          disableClose: false,
          hasBackdrop: true,
          data: { id, ubicaciones, estatus }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.cargarEgresos();
          }
        });
      },
      error: () => {
        this.snackBar.open(
          'Error al cargar los catálogos. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });

  }


  onBorrarEgreso(id: number) {

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Eliminar el Evento',
        mensaje: '¿Estás seguro de borrar este Evento?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.borrarIngresoEvento(id);
      }
    });
  }

  borrarIngresoEvento(id: number): void {
    if (this.eliminandoIds.has(id)) {
      return;
    }
    this.eliminandoIds.add(id); // 👈 Asegúrate de agregarlo al Set aquí antes de suscribir

    this.eventosingresoService.deleteEventosIngresoById(id).subscribe({
      next: () => {
        this.snackBar.open('Egreso eliminado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // 👈 Posponemos la recarga al siguiente ciclo para evitar el error NG0100
        setTimeout(() => {
          this.leeDatos();
        });
      },
      error: (err) => {
        console.error('Error al eliminar egreso:', err);
        this.snackBar.open('Error al eliminar el egreso', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.eliminandoIds.delete(id);
      }
    });
  }

}
