import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ICasaCreate } from '../interface/icasa.interfase';
import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { IUbicacion } from './DOT/IUbicacion.model';


export const passwordsIgualesValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const password = form.get('Password')?.value;
  const confirmPassword = form.get('ConfirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsNoCoinciden: true };
};

@Component({
  selector: 'app-nuevoinmueble',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevoinmueble.html',
  styleUrl: './nuevoinmueble.css',
})
export class Nuevoinmueble implements OnInit {
  // Inyección moderna con inject()
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<Nuevoinmueble>);
  private readonly _inmueblesServices = inject(InmueblesServices);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);


  estadosOcupacion: IEstadosOcupacion[] = [];
  numeroCasaVacio: boolean = true;
  ubicaciones: IUbicacion[] = []; // Variable para almacenar las ubicaciones  




  inmuebleForm: FormGroup = this.fb.group({
    Ubicacion: ['', Validators.required],
    NumeroCasa: ['', [Validators.required, Validators.pattern(/^[^\s]+$/)]],
    CuotaDeMantenimientoBase: ['', Validators.required],
    EstadoOcupacion: ['-1', [Validators.required, Validators.min(0)]],
    NumeroHabitantes: ['', Validators.required],
    Observaciones: ['']
  });

nuevaCasa: ICasaCreate = {
  numeroCasa: '',
  idubicacion: 0,
  cuotaDeMantenimientoBase: 0,
  estadoOcupacion: 0,
  numeroHabitantes: 0,
  observaciones: ''
};

  ngOnInit(): void {
    this.getEstadosOcupacion();
    this.getUbicaciones();
  }

  getUbicaciones(): void {
    this._inmueblesServices.getUbicaciones().subscribe({
      next: (data) => {
        this.ubicaciones = data;
        this.cdr.detectChanges(); // Fuerzas la re-evaluación en el momento justo
      },
      error: (err) => console.error('Error al cargar las Ubicaciones:', err)
    });
  }

  getEstadosOcupacion(): void {
    this._inmueblesServices.getEstadosOcupacion().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.estadosOcupacion = data;
        });
      },
      error: (err) => console.error('Error al cargar los Estados de Ocupación:', err)
    });
  }
  mostrarConfirmacion(): void {

    Object.keys(this.inmuebleForm.controls).forEach(key => {
      const control = this.inmuebleForm.get(key);
      if (control?.invalid) {
        console.log(`Campo inválido: ${key}`, control.errors);
      }
    });

    if (this.inmuebleForm.invalid) {
      this.inmuebleForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa los campos requeridos correctamente.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Inmueble',
        mensaje: '¿Estás seguro de registrar este nuevo inmueble?'
      }
    });

    console.log(this.inmuebleForm);
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        console.log(2);
        this.guardar();
      }
    });
  }

  guardar(): void {
    this.nuevaCasa = this.construirNuevaCasa();

    this._inmueblesServices.postCreateHouse(this.nuevaCasa).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Inmueble registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta); // Se cierra retornando la respuesta del API
      },
      error: (err) => {
        this.snackBar.open(
          'Error al guardar el inmueble. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

private construirNuevaCasa(): ICasaCreate {
  const f = this.inmuebleForm.getRawValue();

  return {
    numeroCasa: f.NumeroCasa,
    idubicacion: Number(f.Ubicacion) || 0,
    cuotaDeMantenimientoBase: Number(f.CuotaDeMantenimientoBase) || 0,
    estadoOcupacion: Number(f.EstadoOcupacion) || 0,
    numeroHabitantes: Number(f.NumeroHabitantes) || 0,
    observaciones: f.Observaciones || ''
  };
}


}  // end class