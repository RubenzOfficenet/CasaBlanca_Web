import { Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { IRol } from '../../catalogo/interface/IRol.interfase.';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { ICasas } from '../../../Models/inmueble.model';
import { Usuarioservice } from '../services/usuarioservice';
import { IUsuarioNuevo } from './DTO/usuarioto.model';

@Component({
  selector: 'app-nuevousuario',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule, MatDialogContent, MatDialogActions, ConfirmDialog],
  templateUrl: './nuevousuario.html',
  styleUrl: './nuevousuario.css',
})
export class Nuevousuario implements OnInit {

  usuarioForm: FormGroup;
  nombreUsuario: string = '';
  modalConfirmacion = viewChild<ConfirmDialog>('modalConfirmacion');
  nombreusuarioOk: boolean = false;

  roles: IRol[] = [];
  inmuebles: ICasas[] = [];
  estatuses: any[] = [];
  nuevoUsuario: IUsuarioNuevo;  

  private catalogosService = inject(catalogosservice);
  private inmueblesService = inject(InmueblesServices);

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<Nuevousuario>,
    private snackBar: MatSnackBar,
    private usuarioService: Usuarioservice
  ) {

    this.usuarioForm = this.fb.group(
      {
        nombreUsuario: ['', Validators.required],
        apellidosUsuario: ['', Validators.required],
        emailUsuario: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmarPassword: ['', Validators.required], // <-- Nuevo
        celularUsuario: [''],
        idRol: [-1, Validators.required],
        idInmueble: [-1, Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      });

      this.nuevoUsuario = {
        nombreUsuario: '',
        apellidosUsuario: '',
        emailUsuario: '',
        password: '',
        celularUsuario: '',
        idRol: 0,
        idInmueble: 0,
        idEstatus: 1
      };
  }

  private construirNuevoUsuario(): IUsuarioNuevo {
    const f = this.usuarioForm.getRawValue();
    
    return {  
        nombreUsuario: f.nombreUsuario,
        apellidosUsuario: f.apellidosUsuario,
        emailUsuario: f.emailUsuario,
        password: f.password,
        celularUsuario: f.celularUsuario,
        idRol: f.idRol,
        idInmueble: f.idInmueble,
        idEstatus: 1
    }
  } 

  ngOnInit(): void {
    this.leeRoles();
    this.leeInmuebles();
  }

  leeInmuebles() {
    this.inmueblesService.getInmuebles().subscribe({
      next: (inmuebles) => {
        this.inmuebles = inmuebles;
        if (this.inmuebles.length > 0) {
          this.usuarioForm.patchValue({
            idInmueble: this.inmuebles[0].id
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  leeRoles() {
    this.catalogosService.getRols().subscribe({
      next: (roles) => {
        this.roles = roles;

        if (this.roles.length > 0) {
          this.usuarioForm.patchValue({
            idRol: this.roles[0].id
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  guardar() { 
    console.log('Formulario de usuario:', this.usuarioForm.value);
    debugger;
    this.nuevoUsuario = this.construirNuevoUsuario();


    this.usuarioService.addUsuario(this.nuevoUsuario).subscribe({
      next: (data) => {
        console.log('Usuario agregado:', data);
        this.dialogRef.close(data); // Cierra el diálogo y pasa los datos de vuelta
      },
      error: (err) => {
        console.error('Error al agregar usuario:', err);
        this.snackBar.open(
          'Error al agregar usuario. Por favor, inténtalo de nuevo.',
          'Cerrar',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          }
        );
      }
    });

    this.dialogRef.close('Usuario agregado...');
  }

  onCancelar() {
    this.dialogRef.close(null);
  }

  mostrarConfirmacion(): void {
    this.nombreusuarioOk = true;
    if (this.usuarioForm.get('nombreUsuario')?.invalid) {
      this.snackBar.open(
        'Debe capturar el nombre del usuario .',
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

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword
      ? null
      : { passwordMismatch: true };
  }


}
