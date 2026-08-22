import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from '@angular/material/table';
import { IListaEventoEgreso } from '../interface/IListaEventoEgreso.interface';
import { Eventoegresoservice } from '../service/eventoegresoservice';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-listaegresosevento',
  imports: [MatProgressSpinner, 
    MatPaginator,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule, 
    CommonModule,
    MatDialogClose,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './listaegresosevento.html',
  styleUrl: './listaegresosevento.css',
})
export class Listaegresosevento {

  private readonly eventosEgresosService = inject(Eventoegresoservice);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogData = inject<{ idEvento: number }>(MAT_DIALOG_DATA);
  
  isLoading: boolean = true;
  idEvento: number = this.dialogData.idEvento;
  dataSource = new MatTableDataSource<IListaEventoEgreso>();

  displayedColumns: string[] = [
    'fechaEvento',
    'nombreUbicacion',
    'numeroCasa',
    'conceptoEgreso',
    'montoEgreso',
    'fechaEgreso',
    'observaciones'
  ];

  constructor() { }

  ngOnInit(): void {
    this.cargarListsaEgresosEvento();
  }

ngAfterViewInit(): void {
}

  cargarListsaEgresosEvento(): void {
    this.isLoading = true;

    this.eventosEgresosService.leeListaEventoEgreso(this.idEvento).subscribe({
      next: (response: IListaEventoEgreso[]) => {

        console.log('Datos de egresos obtenidos:', response);

        this.dataSource.data = response;
        this.isLoading = false;
        this.cdr.markForCheck();

      },
      error: (error) => {
        console.error('Error al obtener la lista de Egresos', error);
        this.snackBar.open('Error al obtener la lista de Egresos', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }



}  // end class
