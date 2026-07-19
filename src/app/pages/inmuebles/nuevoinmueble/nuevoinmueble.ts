import { Component, viewChild } from '@angular/core';
import { MatDialogContent, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ICasaCreate } from '../interface/icasa.interfase';
import { FormsModule, NgForm, Validators } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordsIgualesValidator: ValidatorFn =
  (form: AbstractControl): ValidationErrors | null => {

    const password = form.get('Password')?.value;
    const confirmPassword = form.get('ConfirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordsNoCoinciden: true };
};

@Component({
  selector: 'app-nuevoinmueble',
  imports: [MatDialogContent, MatDialogActions, MatDialogModule, MatButtonModule, FormsModule, ReactiveFormsModule, ConfirmDialog, MatSnackBarModule],
  templateUrl: './nuevoinmueble.html',
  styleUrl: './nuevoinmueble.css',
})
export class Nuevoinmueble {


  
  //casaCreate: ICasaCreate;
  inmuebleForm: FormGroup;
  estadosOcupacion: IEstadosOcupacion[] = [];
  modalConfirmacion = viewChild<ConfirmDialog>('modalConfirmacion');
  nuevaCasa: ICasaCreate;
  numeroCasaVacio: boolean = true;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<Nuevoinmueble>,
    private _inmueblesServices: InmueblesServices,

    private snackBar: MatSnackBar) {
    this.inmuebleForm = this.fb.group({
      NumeroCasa: ['', [ Validators.required, Validators.pattern(/^.*\S.*$/)]],
      Ubicacion: [''],
      CuotaDeMantenimientoBase: [''],
      EstadoOcupacion: [''],
      NumeroHabitantes: [''],
      NombreTitular: [''],
      ApellidosTitular: [''],
      CelularTitular: [''],
      EmailTitular: [''],
      Usuario: ['', [Validators.required]],
      Password: ['',[Validators.required, Validators.minLength(8)]],
      ConfirmPassword: ['', Validators.required],
      NombreOcupante: [''],
      ApellidosOcupante: [''],
      CelularOcupante: [''],
      EmailOcupante: [''],
      Observaciones: ['']
    },
    {
      validators: passwordsIgualesValidator
    });

    this.nuevaCasa = {
    numeroCasa: '',
    ubicacion: '',
    cuotaDeMantenimientoBase: 0,
    estadoOcupacion: 0,
    nombreTitular: '',
    apellidosTitular: '',
    emailTitular: '',
    celularTitular: '',
    Usuario : '',
    Password: '',
    ConfirmPassword : '',
    nombreOcupante: '',
    apellidosOcupante: '',
    emailOcupante: '',
    celularOcupante: '',
    numeroHabitantes: 0,
    observaciones: '',
    }
  }

  private construirNuevaCasa(): ICasaCreate {
    const f = this.inmuebleForm.getRawValue();

    return {
      numeroCasa: f.NumeroCasa,
      ubicacion: f.Ubicacion,
      cuotaDeMantenimientoBase: Number(f.CuotaDeMantenimientoBase),
      estadoOcupacion: f.EstadoOcupacion ? Number(f.EstadoOcupacion) : undefined,
      nombreTitular: f.NombreTitular,
      apellidosTitular: f.ApellidosTitular,
      emailTitular: f.EmailTitular,
      Usuario: f.Usuario,
      Password: f.Password,
      ConfirmPassword: f.ConfirmPassword,
      celularTitular: f.CelularTitular,
      nombreOcupante: f.NombreOcupante,
      apellidosOcupante: f.ApellidosOcupante,
      emailOcupante: f.EmailOcupante,
      celularOcupante: f.CelularOcupante,
      numeroHabitantes:  Number(f.NumeroHabitantes),
      observaciones: f.Observaciones
    };
  }


  ngOnInit() {
    this.getEstadosOcupacion();
  }

  guardar() {    
    // valida el formulario
    if (this.inmuebleForm.invalid) {
      this.inmuebleForm.markAllAsTouched();
      this.numeroCasaVacio = true;
      return;
    }

    this.numeroCasaVacio = false;
    this.nuevaCasa = this.construirNuevaCasa();

    this._inmueblesServices.postCreateHouse(this.nuevaCasa).subscribe({
      next: (data) => {
        this.estadosOcupacion = data;

        if (data.length > 0) {
          this.inmuebleForm.patchValue({
            EstadoOcupacion: data[0].id
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar los Estados de Ocupacion:', err);
      }
    });

    this.dialogRef.close('Casa creada...');
  }



  cancelar() {
    this.dialogRef.close(null);
  }


  getEstadosOcupacion() {
    this._inmueblesServices.getEstadosOcupacion().subscribe({
      next: (data) => {
        this.estadosOcupacion = data;
        if (data.length > 0) {
          this.inmuebleForm.patchValue({
            EstadoOcupacion: data[0].id
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar los Estados de Ocupacion:', err);
      }
    });
  }

  mostrarConfirmacion(): void {
    this.numeroCasaVacio = true;
    if (this.inmuebleForm.get('NumeroCasa')?.invalid) {      
      this.snackBar.open(
        'Debe capturar el Número de Casa.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );      
      return;
    }

    this.modalConfirmacion()?.abrir();
  }

  onCancelar(): void {
    console.log('Operación cancelada');
  }




}
