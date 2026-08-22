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

import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../Constants/app.constants';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { IEgresoDTO } from './DTO/IEgresoDTO';
import { Editaregreso } from './editaregreso/editaregreso';
import { Egresosservice } from './services/egresosservice';
import { Nuevoegreso } from './nuevoegreso/nuevoegreso';

@Component({
  selector: 'app-egresos',
  standalone: true,
  imports: [
    CommonModule,
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
    MatDialogModule
  ],
  templateUrl: './egresos.html',
  styleUrl: './egresos.css',
})
export class Egresos implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly egresosService = inject(Egresosservice);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  egresoIdSeleccionado: number = 0;
  fechaActual = new Date();
  gastoConsolidado: number = 0;
  isLoading: boolean = true;
  totalRegistros: number = 0;
  eliminandoIds = new Set<number>();

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
    'fechaEgreso',
    'beneficiario',
    'concepto',
    'monto',
    'observaciones',
    'acciones'
  ];

  dataSource = new MatTableDataSource<IEgresoDTO>();

  // 💡 CLAVE DE LA SOLUCIÓN: Usar Setters en lugar de @ViewChild tradicionales
  // Esto vincula el paginador en el instante exacto en que entra al DOM, sin romper Change Detection.
  @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
    if (mp) {
      this.dataSource.paginator = mp;
    }
  }

  @ViewChild(MatSort) set sort(ms: MatSort) {
    if (ms) {
      this.dataSource.sort = ms;
    }
  }

ngOnInit(): void {
  this.dataSource.filterPredicate = (
    data: IEgresoDTO,
    filter: string
  ): boolean => {
    const texto = filter.trim().toLowerCase();

    // Formatear la fecha para que coincida con el DatePipe del HTML ('dd-MMM-yyyy')
    const fechaFormateada = data.fechaEgreso 
      ? new DatePipe('en-US').transform(data.fechaEgreso, 'dd-MMM-yyyy') ?? ''
      : '';

    return [
      fechaFormateada,
      data.beneficiario,
      data.concepto,
      data.monto,
      data.observaciones,
      data.totalMonto
    ]
      .filter((valor) => valor !== null && valor !== undefined)
      .some((valor) => String(valor).toLowerCase().includes(texto));
  };

  this.dataSource.sortingDataAccessor = (item: IEgresoDTO, property: string) => {
    switch (property) {
      case 'fechaEgreso':
        return new Date(item.fechaEgreso).getTime();
      default:
        return (item as Record<string, any>)[property];
    }
  };

  this.cargarEgresos();
}

  ngAfterViewInit(): void {
    // Aquí el paginator y sort YA están seteados por los @ViewChild setters
    Promise.resolve().then(() => this.cargarEgresos());
  }

  abrirPopup(): void {
    const dialogRef = this.dialog.open(Nuevoegreso, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.leeDatos());
      }
    });
  }

  editarEgreso(id: number): void {
    console.log('Editar egreso con ID:', id);
    const dialogRef = this.dialog.open(Editaregreso, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      data: { id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => this.leeDatos());
      }
    });
  }

  borrarEgreso(id: number): void {

    // Protección contra doble clic 👈
    if (this.eliminandoIds.has(id)) {
      return;
    }

    this.eliminandoIds.add(id);

    console.log('Borrar egreso con ID:', id);

    this.egresosService.borrarEgreso(id).subscribe({
      next: () => {
        this.snackBar.open('Egreso eliminado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.leeDatos();
      },
      error: (err) => {
        console.error('Error al eliminar egreso:', err);
        this.snackBar.open('Error al eliminar el egreso', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.eliminandoIds.delete(id); // 👈 libera el id sin importar éxito o error
      }
    });
  }

  onBorrarEgreso(id: number): void {
    // Servicio de borrado futuro
    console.log('Intentando borrar egreso con ID:', id);
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Borrar Egreso',
        mensaje: '¿Estás seguro de borrar el egreso?'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.borrarEgreso(id);
      }
      // Si presiona "No" en la confirmación, simplemente regresamos al formulario para corregir algo si lo desea.
    });
  }

  leeDatos(): void {
    this.cargarEgresos();
  }

  cargarEgresos(): void {
    this.isLoading = true;
    const indiceYear: number = Number(this.anioSeleccionado);
    const anio: number = YEAR_CONSTATS[indiceYear];
    const indiceMonth: number = Number(this.mesActual);

    this.egresosService.getEgresos(anio, indiceMonth).subscribe({
      next: (response: IEgresoDTO[]) => {
        // Difiere al siguiente ciclo para evitar chocar con la
        // inicialización del paginador/sort en la misma pasada de CD
        setTimeout(() => {
          this.dataSource.data = response;
          this.totalRegistros = response.length;
          this.gastoConsolidado = response.length > 0 ? response[0].totalMonto ?? 0 : 0;
          this.isLoading = false;
          this.cdr.markForCheck();
        });
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

  editarIngreso(id: number): void {
    this.editarEgreso(id);
  }

  borrarIngreso(id: number): void {
    this.borrarEgreso(id);
  }
}