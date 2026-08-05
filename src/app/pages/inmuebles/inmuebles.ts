import { Component, inject, signal, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Nuevoinmueble } from './nuevoinmueble/nuevoinmueble';
import { InmueblesServices } from './services/inmuebles-services';
import { ICasas } from '../../Models/inmueble.model';
import { MatSortModule } from '@angular/material/sort';
import { CurrencyPipe } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Editarinmueble } from './editarinmueble/editarinmueble';


@Component({
  selector: 'app-inmuebles',
  imports: [MatButtonModule,
            MatDialogModule,
            MatSortModule,
            CurrencyPipe,
            MatTableModule,
            MatPaginatorModule,
            MatFormFieldModule,
            MatInputModule, 
            MatProgressSpinnerModule,
            MatIconModule,
            MatTooltipModule],
  templateUrl: './inmuebles.html',
  styleUrl: './inmuebles.css',
})


export class Inmuebles implements AfterViewInit {

  isLoading = true; // al inicio está cargando

  displayedColumns: string[] = [
    'numeroCasa',
    'nombreubicacion',
    'cuotaDeMantenimientoBase',
    'estadoInicialOcupacion',
    'nombreTitular',
    'emailTitular',
    'celularTitular',
    'nombreOcupante',
    'emailOcupante',
    'celularOcupante',
    'numeroHabitantes',
    'acciones'

  ];

  
  

  dataSource = new MatTableDataSource<ICasas>([]);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  casas = signal<ICasas[]>([]);
  totalRegistros?: number;

  constructor(private dialog: MatDialog, private _inmueblesServices: InmueblesServices) {
    
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (data: ICasas, filter: string): boolean => {
      const normalizedFilter = filter.trim().toLowerCase();

      return (data.nombreTitular?.toLowerCase().includes(normalizedFilter) ?? false)
        || (data.numeroCasa !== undefined && data.numeroCasa.toString().toLowerCase().includes(normalizedFilter))
        || (data.nombreOcupante?.toLowerCase().includes(normalizedFilter) ?? false)
        || (data.nombreubicacion?.toLowerCase().includes(normalizedFilter) ?? false);
    };

    this.cargaDatosInmuebles();
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  cargaDatosInmuebles() {
    this._inmueblesServices.getInmuebles().subscribe({
      next: (data) => {
        console.log('Datos de inmuebles recibidos:', data);
        this.dataSource.data = data;   // ✅ Actualizas los datos sin recrear el dataSource
        this.totalRegistros = data.length;
        this.isLoading = false;
        //console.log("Se cargaron los datos de los inmuebles");
        
      },
      error: (err) => {
        console.error('Error al cargar los inmuebles:', err);
      }
    });
  }

  abrirPopup() {
    const dialogRef = this.dialog.open(Nuevoinmueble, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log('Datos recibidos del popup:', result);
        this.cargaDatosInmuebles();
      } else {
        //console.log('El usuario canceló');
      }
    });
  }


  editarCasa(casa: number){

    //console.log(casa);


    const dialogRef = this.dialog.open(Editarinmueble, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '700px',
      data : {
        id : casa
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log('Datos recibidos del popup:', result);
        this.cargaDatosInmuebles();
      } else {
        //console.log('El usuario canceló');
      }
    });   
    
    this.cargaDatosInmuebles();
    
  }

}
