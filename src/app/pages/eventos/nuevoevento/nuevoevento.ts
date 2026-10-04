import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatDatepickerToggle, MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { take } from 'rxjs';

@Component({
  selector: 'app-nuevoevento',
  imports: [
    MatDialogContent,
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
    MatButtonModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './nuevoevento.html',
  styleUrl: './nuevoevento.css'
})
export class Nuevoevento implements OnInit, AfterViewInit {

  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly eventosingresoService = inject(EventosingresoService);
  private readonly dialogRef = inject(MatDialogRef<Nuevoingreso>);
  private readonly inmueblesServices = inject(InmueblesServices);
  private readonly dialogData = inject<{ ubicaciones: Ubicacion[]; estatus: EstatusEvento[] }>(MAT_DIALOG_DATA);
  private readonly cdr = inject(ChangeDetectorRef);

  ubicacionList: Ubicacion[] = this.dialogData?.ubicaciones ?? [];
  estatusList: EstatusEvento[] = this.dialogData?.estatus ?? [];

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
    // Escuchamos los cambios del formulario
    this.escucharCambiosFormulario();
  }

  ngAfterViewInit(): void {
    // Forzamos la detección de cambios para evitar NG0100 en el renderizado inicial del modal
    this.cdr.detectChanges();
  }

  private escucharCambiosFormulario(): void {
    // Escucha cambios en la ubicación
    this.eventoForm.controls.idubicacion.valueChanges.subscribe((idUbicacion) => {
      if (idUbicacion && idUbicacion > 0) {
        this.onUbicacionChange(idUbicacion);
      }
    });

    // Escucha cambios en la casa/inmueble
    this.eventoForm.controls.idinmueble.valueChanges.subscribe((idCasa) => {
      if (idCasa && idCasa > 0) {
        this.onCasaChange(idCasa);
      }
    });
  }

  onUbicacionChange(idUbicacion: number): void {
    const ubicacionSeleccionada = this.ubicacionList.find(u => u.id === idUbicacion);

    // Evitamos mutar variables de vista en medio del ciclo actual
    setTimeout(() => {
      this.seccionSelected = Number(ubicacionSeleccionada?.id || 0);

      this.eventoForm.patchValue({
        idinmueble: 0,
        nombretitular: '',
        nombreOcupante: ''
      }, { emitEvent: false });

      if (this.seccionSelected > 0) {
        this.LeerCasasDeSeccion(this.seccionSelected);
      }
    }, 0);
  }

  LeerCasasDeSeccion(idSeccion: number): void {
    if (!idSeccion) {
      this.casalist = [];
      return;
    }

    this.inmueblesServices.leeCasasporSeccion(idSeccion)
      .pipe(take(1))
      .subscribe({
        next: (respuesta: ICasaRsponse[]) => {
          this.casalist = respuesta;
          // Notificamos a Angular de la nueva lista cargada por la API
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open(
            'Error al leer las secciones',
            'Cerrar',
            { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          );
        }
      });
  }

  onCasaChange(idCasa: number): void {
    const casaSeleccionada = this.casalist.find(u => u.id === idCasa);
    console.log('Casa seleccionada:', casaSeleccionada);
    if (casaSeleccionada) {
      setTimeout(() => {
        this.eventoForm.patchValue({
          nombretitular: casaSeleccionada.nombretitular,
          nombreOcupante: casaSeleccionada.nombreocupante
        }, { emitEvent: false });
      }, 0);
    }
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

    ref.afterClosed().pipe(take(1)).subscribe((confirmado) => {
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

    console.log('Evento DTO a enviar:', eventoDto);

    this.eventosingresoService.agregaEvento(eventoDto)
      .pipe(take(1))
      .subscribe({
        next: (respuesta) => {
          this.snackBar.open('Evento registrado con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(respuesta);
        },
        error: () => {
          this.snackBar.open(
            'Error al registrar el evento. Inténtalo de nuevo.',
            'Cerrar',
            { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          );
        }
      });
  }
}