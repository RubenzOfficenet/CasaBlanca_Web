import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Nuevoingreso } from './nuevoingreso/nuevoingreso';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { IIngreso } from './nuevoingreso/DTO/ingreso.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, CurrencyPipe } from '@angular/common';

import { Ingresoservice } from './services/ingresoservice';
import { IIngresoResponse } from './nuevoingreso/DTO/ingresoResponse.model';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../Constants/app.constants'

@Component({
  selector: 'app-ingresos',
  imports: [MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    DatePipe,
    CurrencyPipe,
    MatProgressSpinner,
    MatSortModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos implements OnInit {

  totalRegistros: number = 15;
  isLoading = true;
  filtros: { [key: string]: string } = {};
  today: Date = new Date();
  yearList = Object.entries(YEAR_CONSTATS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));

  monthList = Object.entries(MONTH_CONSTANTS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));


  anioSeleccionado: number = this.yearList[0].value; // primer elemento

  mesActual: number = new Date().getMonth() + 1;

  constructor(private dialog: MatDialog, private ingresosService: Ingresoservice) { }

  displayedColumns: string[] = [
    'numeroCasa',
    'nombreTitular',
    'fechaRecepcion',
    'numeroRecibo',
    'concepto',
    'fechaConcepto',
    'monto',
    'observaciones',
    'acciones'
  ];

  dataSource = new MatTableDataSource<IIngresoResponse>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnInit(): void {
    this.dataSource.filterPredicate = (
      data: IIngresoResponse,
      filter: string
    ): boolean => {
      const texto = filter.trim().toLowerCase();

      return [
        data.numeroCasa,
        data.nombreTitular,
        data.numeroRecibo,
        data.concepto,
        data.observaciones
      ]
        .filter(valor => valor !== null && valor !== undefined)
        .some(valor => String(valor).toLowerCase().includes(texto));
    };

    this.cargarIngresos();
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  leeDatos() {
    console.log('Año seleccionado:', this.anioSeleccionado);
    console.log('Mes seleccionado:', this.mesActual);
   }

  cambiaAnio(anioSeleccionado: number): void {
    console.log('Año seleccionado:', anioSeleccionado);
  }

  cambiaMes(mesSeleccionado: number): void {
    console.log('Mes seleccionado:', mesSeleccionado);
    // aquí tu lógica, por ejemplo:
    // this.mesActual = mesSeleccionado;
    // this.cargarDatosPorMes(mesSeleccionado);
  }

  editar(registro: IIngreso): void {
    console.log(registro);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }


  abrirPopup() {
    const dialogRef = this.dialog.open(Nuevoingreso, {
      width: '40vw',       // 80% del ancho de la pantalla (Viewport Width)
      maxWidth: '2000px',   // No crecerá más de 800px
      minWidth: '320px',   // No se encogerá a menos de 320px
      disableClose: false, // Evita que se cierre al hacer clic fuera o presionar Escape
      hasBackdrop: true
    });

    // Capturar el resultado cuando se cierre
    dialogRef.afterClosed().subscribe(result => {
      console.log('El pop-up se cerró. Resultado:', result);
      if (result === true) {
        // El usuario hizo clic en "Aceptar"
      }
    });
  }

  cargarIngresos(): void {
    this.ingresosService.getIngresos().subscribe({
      next: (response: IIngresoResponse[]) => {
        this.dataSource.data = response;
        this.totalRegistros = response.length;
        this.isLoading = false;
        console.log('Ingresos cargados:', response);
      },
      error: (error) => {
        console.error('Error al obtener los ingresos', error);
      }
    });

    this.isLoading = false;
  }

  filtrar(columna: string, event: Event): void {
    const valor = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.filtros[columna] = valor;
    this.dataSource.filter = JSON.stringify(this.filtros);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editarIngreso(id: number): void {

  }

}
