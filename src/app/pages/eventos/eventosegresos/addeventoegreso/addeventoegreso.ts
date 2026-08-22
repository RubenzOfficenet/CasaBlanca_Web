import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ICatalogoEventoEgreso } from '../interface/icatalogo-evento-egreso';
import { MatDialogContent, MatDialogActions, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDialogClose } from "@angular/material/dialog";
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { Eventoegresoservice } from '../service/eventoegresoservice';
import { IEventoEgreso } from '../interface/ievento-egreso';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-addeventoegreso',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose],
  templateUrl: './addeventoegreso.html',
  styleUrl: './addeventoegreso.css',
})
export class Addeventoegreso implements OnInit {

  egresoEventoForm: FormGroup;
  private readonly dialog = inject(MatDialog);
  private readonly eventoEgresoService = inject(Eventoegresoservice);
  private readonly dialogData = inject<{ idEvento: number }>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<Addeventoegreso>);
  // Catálogo de conceptos usando Signals
  conceptos = signal<ICatalogoEventoEgreso[]>([]);
  cargandoConceptos = signal<boolean>(false);
  idEvento: number = this.dialogData.idEvento;
  guardando = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.egresoEventoForm = this.fb.group({
      conceptoId: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: [new Date(), Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    console.log('idEvento : ', this.idEvento);
    this.leeCatalogoConceptos();
  }
  // onGuardar(): void {
  //   if (this.egresoEventoForm.valid) {
  //     const payload = this.egresoEventoForm.value;
  //     console.log('Datos a guardar:', payload);
  //   } else {
  //     this.egresoEventoForm.markAllAsTouched();
  //   }
  // }

  onCancelar(): void {
    this.egresoEventoForm.reset({
      fecha: new Date()
    });
  }

  mostrarConfirmacion(): void {
    if (this.egresoEventoForm.invalid) {
      this.egresoEventoForm.markAllAsTouched();
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Datos',
        mensaje: '¿Estás seguro de guardar los datos?'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.onGuardar();
      }
      // Si presiona "No" en la confirmación, simplemente regresamos al formulario para corregir algo si lo desea.
    });
  }

  leeCatalogoConceptos(): void {
    this.cargandoConceptos.set(true);
    this.eventoEgresoService.leeCatalogoEventoEgrso().subscribe({
      next: (data: ICatalogoEventoEgreso[]) => {
        this.conceptos.set(data);
        this.cargandoConceptos.set(false);
      },
      error: (err) => {
        console.error('Error al obtener el catálogo de conceptos:', err);
        this.cargandoConceptos.set(false);
      }
    });
  }


  onGuardar(): void {
    if (this.egresoEventoForm.invalid) {
      this.egresoEventoForm.markAllAsTouched();
      return;
    }

    const formValue = this.egresoEventoForm.value;

    const eventoEgreso: IEventoEgreso = {
      IdEventoIngreso: this.idEvento,
      IdConceptoEgresoEvento: formValue.conceptoId,
      MontoEgreso: formValue.monto,
      FechaEgreso: formValue.fecha,
      Observaciones: formValue.observaciones
    };

    this.guardando.set(true);

    console.log(eventoEgreso);

    this.eventoEgresoService.addEgresoEvento(eventoEgreso).subscribe({
      next: (nuevoId: Number) => {
        this.guardando.set(false);
        this.snackBar.open('Egreso agregado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.dialogRef.close(true); // cierra el diálogo e indica éxito
      },
      error: (err) => {
        console.error('Error al agregar el egreso:', err);
        this.guardando.set(false);
        this.snackBar.open('Error al agregar el egreso', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }


} // end class
