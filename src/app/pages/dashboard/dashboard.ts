import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { IResumenanalitico } from './intgerface/iresumenanalitico.interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Resumenanaliticoservice } from './service/resumenanaliticoservice';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatFormField, MatLabel, MatSelect, MatOption } from "@angular/material/select";
import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../Constants/app.constants';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule,
    CurrencyPipe,
    MatFormField,
    NgClass,
    MatProgressSpinnerModule,
    DatePipe,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private readonly resumenAnaliticoService = inject(Resumenanaliticoservice);

  displayedColumns: string[] = [
    'fechaDeOperacion',
    'concepto',
    'ubicacion',
    'casa',
    'tipo',
    'monto',
    'observaciones'
  ];

  totalIngresos: number = 0;
  totalEgresos: number = 0;
  isLoading = false;
  dataSource = new MatTableDataSource<IResumenanalitico>();


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





  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.configurarFiltro();
    this.leeDatos();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  

configurarFiltro(): void {
  this.dataSource.filterPredicate = (data: IResumenanalitico, filter: string): boolean => {
    const textoFiltro = filter.trim().toLowerCase();

    const concepto = (data.concepto ?? '').toLowerCase();
    const ubicacion = (data.ubicacion ?? '').toLowerCase();
    const casa = (data.casa ?? '').toLowerCase();
    const tipo = (data.tipo ?? '').toLowerCase();
    return concepto.includes(textoFiltro) ||
      ubicacion.includes(textoFiltro) ||
      casa.includes(textoFiltro) ||
      tipo.includes(textoFiltro);
  };
}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  leeDatos(): void {
    this.isLoading = true;
    this.resumenAnaliticoService.getRefsumenAnalitico().subscribe({
      next: (data: IResumenanalitico[]) => {
        this.dataSource.data = data;
        if (data.length > 0) {
          this.totalIngresos = data[0].totalIngresos;
          this.totalEgresos = data[0].totalEgresos;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener el resumen analítico:', err);
        this.isLoading = false;
      }
    });
  }

  cambiaAnio(anioSeleccionado: number): void {
    this.leeDatos();
  }

  cambiaMes(mesSeleccionado: number): void {
    this.leeDatos();
  }


  editarOperacion(rerumenAnalitico: any) { }


} // end class
