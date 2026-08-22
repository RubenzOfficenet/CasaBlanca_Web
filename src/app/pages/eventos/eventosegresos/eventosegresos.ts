import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../../Constants/app.constants';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventosingresoService } from '../services/eventosingresoService';
import { IEventoIngreso } from '../Model/Evento.model';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Addeventoegreso } from './addeventoegreso/addeventoegreso';
import {MatBadgeModule} from '@angular/material/badge';
import { Listaegresosevento } from './listaegresosevento/listaegresosevento';

@Component({
  selector: 'app-eventosegresos',
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
    MatTooltipModule,
    NgClass,
    MatBadgeModule],
  templateUrl: './eventosegresos.html',
  styleUrl: './eventosegresos.css',
})
export class Eventosegresos {

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
    'estatusEvento',
    'acciones'];


  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly eventosingresoService = inject(EventosingresoService);

  constructor() { }
  ngOnInit(): void {
    this.leeDatos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  cambiaAnio(anioSeleccionado: number): void {
    this.leeDatos();
  }

  cambiaMes(mesSeleccionado: number): void {
    this.leeDatos();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  // editarEgreso(id: number) { };

  // onBorrarEgreso(id: number) { };


  agregarEgreso(){}

  onListaEgreso(id:number){}

  abrirPopup(idEvento : number): void {
const dialogRef = this.dialog.open(Addeventoegreso, {
  width: '40vw',
  height: '45vh',
  maxWidth: '2000px',
  maxHeight: '90vh',
  minWidth: '320px',
  disableClose: false,
  hasBackdrop: true,
  data: { idEvento: idEvento }
});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.leeDatos());
      }
    });
  }


  mostrarListaEgresos(idEvento: number){
      console.log('Editar egreso con ID:', idEvento);
      const dialogRef = this.dialog.open(Listaegresosevento, {
        width: '70vw',
        maxWidth: '2000px',
        minWidth: '320px',
        disableClose: false,
        hasBackdrop: true,
        data: { idEvento }
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          setTimeout(() => this.leeDatos());
        }
      });    
  }

} // end class
