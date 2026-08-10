import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatDatepickerToggle, MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ubicacion } from '../Model/ubicacion.interface';
import { MatSelectModule } from '@angular/material/select';
import { EstatusEvento } from '../Model/estatusEvento.interface';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { EventoAddRequest } from '../Model/eventoAdd.interface';
import { EventosingresoService } from '../services/eventosingresoService';
import { Nuevoingreso } from '../../ingresos/nuevoingreso/nuevoingreso';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { ICasaRsponse } from '../../inmuebles/interface/casarequest.interface';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
  selector: 'app-nuevoevento',
  imports: [MatDialogContent,
    MatFormField,
    MatLabel,
    MatDatepickerToggle,
    MatDatepicker,
    MatError,
    MatDialogActions,
    MatDatepickerModule,
    MatDialogClose,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './nuevoevento.html',
  styleUrl: './nuevoevento.css',
})
export class Nuevoevento implements OnInit {

  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly eventosingresoService = inject(EventosingresoService);
  private readonly dialogRef = inject(MatDialogRef<Nuevoingreso>);
  private readonly inmueblesServices = inject(InmueblesServices);
  private readonly dialogData = inject<{ ubicaciones: Ubicacion[]; estatus: EstatusEvento[] }>(MAT_DIALOG_DATA);


  ubicacionList: Ubicacion[] = this.dialogData.ubicaciones;
  estatusList: EstatusEvento[] = this.dialogData.estatus;

  casalist: ICasaRsponse[] = [];

  seccionSelected: number = 0;
  casaSelected: number = 0;
  eventoForm = this.fb.nonNullable.group({
    idinmueble: [0, [Validators.required, Validators.min(1)]],
    idestatusevento: [0, [Validators.required, Validators.min(1)]],
    idubicacion: [0, [Validators.required, Validators.min(1)]],
    fechaevento: ['', [Validators.required]],
    nombretitular: [{ value: '', disabled: false }],
    nombreOcupante: [{ value: '', disabled: false }],
    recibonumero: ['', [Validators.required, Validators.maxLength(50)]],
    fechapago: ['', [Validators.required]],
    apartado: [0, [Validators.required, Validators.min(0)]],
    liquida: [0, [Validators.required, Validators.min(0)]],
    luz: [0, [Validators.min(0)]],
    depositogarantia: [0, [Validators.min(0)]],
    limpiezadomingo: [0, [Validators.min(0)]],
    rentainmobiliario: [0, [Validators.min(0)]]
  });


  ngOnInit(): void {
    //this.leeSecciones();
    // this.leeEstatusEvento();

    //console.log('Lista de secciones: ', this.ubicacionList)
  }


  mostrarConfirmacion(): void {

    if (this.eventoForm.invalid) {

      this.eventoForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa todos los campos requeridos.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Registrar Evento',
        mensaje: '¿Estás seguro de guardar este nuevo Evento?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
        
      }
    });
  }

  guardar(): void {
    const datos = this.eventoForm.getRawValue();

    const eventoDto: EventoAddRequest = {
      idInmueble: datos.idinmueble,
      idEstatusEvento: datos.idestatusevento,
      fechaEvento: datos.fechaevento,
      reciboNumero: Number(datos.recibonumero),
      fechaPago: datos.fechapago,
      apartado: Number(datos.apartado),
      liquida: Number(datos.liquida),
      luz: Number(datos.luz),
      depositoGarantia: Number(datos.depositogarantia),
      limpiezaDomingo: Number(datos.limpiezadomingo),
      rentaInmobiliario: Number(datos.rentainmobiliario)
    };

    // console.log(eventoDto);

    this.eventosingresoService.agregaEvento(eventoDto).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Evento registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta);
      },
      error: (error) => {
        //console.error('Error al crear el evento:', error);
        this.snackBar.open(
          'Error al registrar el evento. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }


  // leeSecciones(): void {

  //   this.catalogosService.leeSecciones().subscribe({
  //     next: (respuesta: Ubicacion[]) => {
  //       this.ubicacionList = respuesta;
  //       //console.log('Lista: ', this.ubicacionList);
  //       //this.cdr.detectChanges();
  //       //this.snackBar.open('Evento registrado con éxito', 'OK', { duration: 3000 });
  //       //this.dialogRef.close(respuesta);
  //     },
  //     error: (error) => {
  //       //console.error('Error leer las secciones:', error);
  //       this.snackBar.open(
  //         'Error leer las secciones',
  //         'Cerrar',
  //         { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
  //       );
  //     }
  //   });
  // }

  // leeEstatusEvento(): void {
  //   this.catalogosService.leeEstatusEvento().subscribe({
  //     next: (respuesta: EstatusEvento[]) => {
  //       this.estatusList = respuesta;
  //       //console.log('Lista: ', this.estatusList);
  //       //this.cdr.detectChanges();
  //       //this.snackBar.open('Evento registrado con éxito', 'OK', { duration: 3000 });
  //       //this.dialogRef.close(respuesta);
  //     },
  //     error: (error) => {
  //       //console.error('Error leer las secciones:', error);
  //       this.snackBar.open(
  //         'Error leer las secciones',
  //         'Cerrar',
  //         { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
  //       );
  //     }
  //   });
  // }

onUbicacionChange(idUbicacion: number): void {
  const ubicacionSeleccionada = this.ubicacionList.find(u => u.id === idUbicacion);
  this.seccionSelected = Number(ubicacionSeleccionada?.id);

  this.eventoForm.patchValue({
    idinmueble: 0,
    nombretitular: '',
    nombreOcupante: ''
  });

  this.LeerCasasDeSeccion(this.seccionSelected);
}


LeerCasasDeSeccion(idSeccion: number) {
  this.inmueblesServices.leeCasasporSeccion(idSeccion).subscribe({
    next: (respuesta: ICasaRsponse[]) => {
      setTimeout(() => {
        this.casalist = respuesta;
      });
    },
    error: (error) => {
      this.snackBar.open(
        'Error leer las secciones',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
    }
  });
}

onCasaChange(idCasa: number) {
  const casaSeleccionada = this.casalist.find(u => u.id === idCasa);

  if (casaSeleccionada) {
    queueMicrotask(() => {
      this.eventoForm.patchValue({
        nombretitular: casaSeleccionada.nombretitular,
        nombreOcupante: casaSeleccionada.nombreocupante
      });
    });
  }
}

} // end class
