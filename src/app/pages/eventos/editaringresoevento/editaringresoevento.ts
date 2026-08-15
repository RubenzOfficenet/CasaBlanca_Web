import { Component, inject, OnInit } from '@angular/core';
import { MatDialogContent, MatDialogActions, MatDialogModule, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatDatepickerToggle, MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ubicacion } from '../Model/ubicacion.interface';
import { EstatusEvento } from '../Model/estatusEvento.interface';
import { ICasaRsponse } from '../../inmuebles/interface/casarequest.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { EventosingresoService } from '../services/eventosingresoService';
import { IEventoIngresoEdit } from '../interface/EventoIngreso.interface';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { IEventoIngresoUpdate } from '../interface/eventooingresoUpdate.interface';

@Component({
  selector: 'app-editaringresoevento',
  imports: [
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatDatepickerToggle,
    MatDatepicker,
    MatDialogActions,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './editaringresoevento.html',
  styleUrl: './editaringresoevento.css',
})
export class Editaringresoevento implements OnInit {

  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly dialogData = inject<{ id: number, ubicaciones: Ubicacion[]; estatus: EstatusEvento[] }>(MAT_DIALOG_DATA);
  private readonly eventosingresoService = inject(EventosingresoService);
  private readonly inmueblesServices = inject(InmueblesServices);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<Editaringresoevento>);

  ubicacionList: Ubicacion[] = this.dialogData.ubicaciones;
  estatusList: EstatusEvento[] = this.dialogData.estatus;
  idEvento: number = this.dialogData.id;
  casalist: ICasaRsponse[] = [];
  idSeccion: number = 0;
  eventoIngresoData?: IEventoIngresoEdit;

  eventoForm = this.fb.nonNullable.group({
    idinmueble: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
    idestatusevento: [0, [Validators.required, Validators.min(1)]],
    idubicacion: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
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
    this.leeEventoById();
  }

  leeEventoById() {
    this.eventosingresoService.leeEventosIngresoById(this.idEvento).subscribe({
      next: (data: IEventoIngresoEdit) => {
        // 1. Cargar la lista de inmuebles según la ubicación del evento primero
        if (data.idUbicacion) {
          this.idSeccion = data.idUbicacion;
          this.inmueblesServices.leeCasasporSeccion(data.idUbicacion).subscribe({
            next: (casas: ICasaRsponse[]) => {
              this.casalist = casas;

              // 2. Una vez que la lista de casas ya está cargada, actualizamos el formulario
              this.eventoForm.patchValue({
                idinmueble: data.idInmueble,
                idestatusevento: data.idEstatusEvento,
                idubicacion: data.idUbicacion,
                fechaevento: data.fechaEvento,
                nombretitular: data.nombreTitular,
                nombreOcupante: data.nombreOcupante,
                recibonumero: data.reciboNumero,
                fechapago: data.fechaPago,
                apartado: data.apartado,
                liquida: data.liquida,
                luz: data.luz,
                depositogarantia: data.depositoGarantia,
                limpiezadomingo: data.limpiezaDomingo,
                rentainmobiliario: data.rentaInmobiliario
              });
            },
            error: () => this.mostrarErrorCasas()
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener el evento de ingreso:', err);
      }
    });
  }

  onUbicacionChange(idUbicacion: number) {
    this.idSeccion = idUbicacion;
    this.inmueblesServices.leeCasasporSeccion(idUbicacion).subscribe({
      next: (respuesta: ICasaRsponse[]) => {
        this.casalist = respuesta;
        // Reiniciar el select de inmueble si cambia la ubicación
        this.eventoForm.controls.idinmueble.setValue(0);
      },
      error: () => this.mostrarErrorCasas()
    });
  }

  private mostrarErrorCasas() {
    this.snackBar.open(
      'Error al leer las secciones/casas',
      'Cerrar',
      { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
    );
  }

  onCasaChange(id: number) { }

  mostrarConfirmacion() {
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
        titulo: 'Actualizar Evento',
        mensaje: '¿Estás seguro de actualñizar el Evento?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.actualizar();
      }
    });
  }

  actualizar(): void {
    const datos = this.eventoForm.getRawValue();

    const eventoDto: IEventoIngresoUpdate = {
      id: this.idEvento,
      idInmueble: datos.idinmueble,
      idEstatusEvento: datos.idestatusevento,
      fechaEvento: datos.fechaevento,
      reciboNumero: datos.recibonumero,
      fechaPago: datos.fechapago,
      apartado: Number(datos.apartado),
      liquida: Number(datos.liquida),
      luz: Number(datos.luz),
      depositoGarantia: Number(datos.depositogarantia),
      limpiezaDomingo: Number(datos.limpiezadomingo),
      rentaInmobiliario: Number(datos.rentainmobiliario)
    };

    this.eventosingresoService.updateEventosIngresoById(eventoDto).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Evento actualizado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta);
      },
      error: (error) => {
        //console.error('Error al crear el evento:', error);
        this.snackBar.open(
          'Error al registrar el ingreso del evento. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }


}  // end class