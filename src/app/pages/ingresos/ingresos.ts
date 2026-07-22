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
    CurrencyPipe],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos implements OnInit  {

  constructor(private dialog: MatDialog, private ingresosService: Ingresoservice) { }
  
  ngOnInit(): void {
    this.cargarIngresos();
  }

  displayedColumns: string[] = [
    'casa',
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  editar(registro: IIngreso): void {
    console.log(registro);
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
        this.dataSource.paginator = this.paginator;
        console.log('Ingresos cargados:', response);
      },
      error: (error) => {
        console.error('Error al obtener los ingresos', error);
      }
    });
  }



}
