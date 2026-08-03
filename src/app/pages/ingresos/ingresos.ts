import { Component, ViewChild, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IIngresoResponse } from './nuevoingreso/DTO/ingresoResponse.model';
import { Ingresoservice } from './services/ingresoservice';
import { Nuevoingreso } from './nuevoingreso/nuevoingreso';
import { Editaringreso } from './editaringreso/editaringreso';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../Constants/app.constants';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
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
    MatProgressSpinnerModule,
    MatSortModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos implements OnInit, AfterViewInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly ingresosService = inject(Ingresoservice);

  fechaActual = new Date();
  today: Date = new Date();
  
  totalRegistros: number = 0;
  isLoading: boolean = true;
  filtros: Record<string, string> = {};
  
  recaudacionTotal: number = 0;
  CarteraVencida: number = 0;
  efectividadCobro: number = 0;
  ingresoId: number = 0;

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
    // Sincronizar búsqueda global y por columna
    this.dataSource.filterPredicate = (
      data: IIngresoResponse,
      filter: string
    ): boolean => {
      // 1. Si el filtro es un JSON (búsqueda por columna específica)
      if (filter.startsWith('{')) {
        const searchTerms = JSON.parse(filter) as Record<string, string>;
        return Object.keys(searchTerms).every((column) => {
          const term = searchTerms[column];
          if (!term) return true;
          const val = (data as Record<string, any>)[column];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      }

      // 2. Si el filtro es texto plano (búsqueda general)
      const texto = filter.trim().toLowerCase();
      return [
        data.numeroCasa,
        data.nombreTitular,
        data.numeroRecibo,
        data.concepto,
        data.observaciones
      ]
        .filter((valor) => valor !== null && valor !== undefined)
        .some((valor) => String(valor).toLowerCase().includes(texto));
    };

    // Manejo personalizado del ordenamiento en la tabla
    this.dataSource.sortingDataAccessor = (item: IIngresoResponse, property: string) => {
      switch (property) {
        case 'fechaRecepcion':
        case 'fechaConcepto':
          return item[property] ? new Date(item[property]).getTime() : 0;
        case 'monto':
          return Number(item.monto) || 0;
        default:
          return (item as Record<string, any>)[property];
      }
    };

    this.cargarIngresos();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filtrar(columna: string, event: Event): void {
    const valor = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (valor) {
      this.filtros[columna] = valor;
    } else {
      delete this.filtros[columna];
    }

    this.dataSource.filter = Object.keys(this.filtros).length > 0 
      ? JSON.stringify(this.filtros) 
      : '';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  leeDatos(): void {
    this.cargarIngresos();
  }

  cambiaAnio(anioSeleccionado: number): void {
    this.leeDatos();
  }

  cambiaMes(mesSeleccionado: number): void {
    this.leeDatos();
  }

  abrirPopup(): void {
    const dialogRef = this.dialog.open(Nuevoingreso, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarIngresos();
      }
    });
  }

  editarIngreso(id: number): void {
    const dialogRef = this.dialog.open(Editaringreso, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      data: { id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarIngresos();
      }
    });
  }

  cargarIngresos(): void {
    this.isLoading = true;
    const indiceYear: number = Number(this.anioSeleccionado);
    const anio: number = YEAR_CONSTATS[indiceYear];
    const indiceMonth: number = Number(this.mesActual);

    this.ingresosService.getIngresos(anio, indiceMonth).subscribe({
      next: (response: IIngresoResponse[]) => {
        this.dataSource.data = response;
        this.totalRegistros = response.length;
        this.recaudacionTotal = response.length > 0 ? Number(response[0].totalMonto ?? 0) : 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los ingresos', error);
        this.isLoading = false;
      }
    });
  }

  borrarIngreso(id: number): void {
    this.ingresoId = id;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Eliminar Ingreso',
        mensaje: '¿Estás seguro de borrar este registro?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.onBorrarIngreso();
      }
    });
  }

  onBorrarIngreso(): void {
    this.ingresosService.deleteIngreso(this.ingresoId).subscribe({
      next: () => {
        this.snackBar.open('Se borró el ingreso correctamente', 'Cerrar', {
          duration: 3000,
        });
        this.leeDatos();
      },
      error: (error) => {
        this.snackBar.open('Error al borrar el ingreso', 'Cerrar', {
          duration: 4000,
        });
        console.error('Error al borrar el ingreso:', error);
      }
    });
  }

  onCancelar(): void {}
}