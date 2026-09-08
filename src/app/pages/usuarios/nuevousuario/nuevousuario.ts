import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder,FormsModule,ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { IRol } from '../../catalogo/interface/IRol.interfase.';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { ICasas } from '../../../Models/inmueble.model';
import { Usuarioservice } from '../services/usuarioservice';
import { IUsuarioNuevo } from './DTO/usuarioto.model';
import { IUbicacion } from '../../inmuebles/nuevoinmueble/DOT/IUbicacion.model';
import { ICasaRsponse } from '../../inmuebles/interface/casarequest.interface';
import {MatRadioModule} from '@angular/material/radio';
import { ICatalogocasas } from '../../inmuebles/interface/icatalogocasas.interface';

@Component({
  selector: 'app-nuevousuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    MatRadioModule,
    FormsModule
  ],
  templateUrl: './nuevousuario.html',
  styleUrl: './nuevousuario.css',
})
export class Nuevousuario implements OnInit {
  // Inyección moderna de dependencias
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<Nuevousuario>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usuarioService = inject(Usuarioservice);
  private readonly catalogosService = inject(catalogosservice);
  private readonly inmueblesService = inject(InmueblesServices);
  private readonly dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  roles: IRol[] = [];
  inmuebles: ICatalogocasas[] = [];
  ubicaciones: IUbicacion[] = [];
  seccionSelected: number = 0;
  casaSelected: number = 0;
  casalist: ICasaRsponse[] = [];
  idTipoRelacion: number = 1;

  nuevoUsuario: IUsuarioNuevo = {
    nombreUsuario: '',
    apellidosUsuario: '',
    celularUsuario: '',
    emailUsuario: '',
    password: '',
    confirmarPassword: '',
    idUbicacion: 0,
    idInmueble: 0,
    idRol: 0,
    idEstatus: 1,
    idTipoRelacion : 1
  };

usuarioForm = this.fb.group(
  {
    nombreUsuario: ['', Validators.required],
    apellidosUsuario: ['', Validators.required],
    celularUsuario: [''],
    emailUsuario: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmarPassword: ['', Validators.required],
    idUbicacion: [-1, Validators.required], // 👈 renombrado y con -1 como los otros ids
    idInmueble: [-1, Validators.required],
    idRol: [-1, Validators.required],
    idEstatus: [-1, Validators.required],
    idTipoRelacion: [1, Validators.required]
  },
  {
    validators: this.passwordMatchValidator
  }
);
  ngOnInit(): void {
    this.cargarUbicaciones();
    this.leeRoles();
    //this.leeInmuebles();

  }


  onUbicacionChange(idUbicacion: number): void {
    console.log(idUbicacion);

    const ubicacionSeleccionada = this.ubicaciones.find(u => u.id === idUbicacion);
    this.seccionSelected = Number(ubicacionSeleccionada?.id);

    // 1. Limpiamos o reseteamos el valor del inmueble
    this.usuarioForm.patchValue({
      idInmueble: null // Se recomienda null o '' en lugar de 0 si no existe un id = 0
    });

    // 2. Cargamos las casas correspondientes
    if (this.seccionSelected) {
      this.LeerCasasDeSeccion(this.seccionSelected);
    }
  }


  LeerCasasDeSeccion(idSeccion: number): void {
    this.inmueblesService.leeCasasporSeccion(idSeccion).subscribe({
      next: (respuesta: ICasaRsponse[]) => {
        // Asignación directa sin setTimeout
        this.casalist = respuesta;
        console.log('this.casalist : ', this.casalist);

        // Forzamos la detección de cambios para actualizar el <mat-select>
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open(
          'Error al leer las secciones',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }


  cargarUbicaciones(): void {
    this.inmueblesService.getUbicaciones().subscribe({
      next: (data) => {
        console.log('Ubicaciones obtenidas:', data);
        this.ubicaciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener ubicaciones:', err);
      }
    });
  }


  leeInmuebles(): void {
    this.inmueblesService.getInmuebles().subscribe({
      next: (inmuebles : ICatalogocasas[]) => {
        this.inmuebles = inmuebles;
        if (this.inmuebles.length > 0) {
          this.usuarioForm.patchValue({
            idInmueble: this.inmuebles[0].id
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  leeRoles(): void {
    this.catalogosService.getRols().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (this.roles.length > 0) {
          this.usuarioForm.patchValue({
            idRol: this.roles[0].id
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  mostrarConfirmacion(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa los campos requeridos correctamente.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    // Abrimos el modal con la API de MatDialog
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Usuario',
        mensaje: '¿Estás seguro de registrar este nuevo usuario?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    this.nuevoUsuario = this.construirNuevoUsuario();

    this.usuarioService.addUsuario(this.nuevoUsuario).subscribe({
      next: (data) => {
        //console.log('Usuario agregado:', data);
        this.snackBar.open('Usuario registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(data); // Cierra solo cuando el backend responde éxito
      },
      error: (err) => {
        console.error('Error al agregar usuario:', err);
        this.snackBar.open(
          'Error al agregar usuario. Por favor, inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }

  private construirNuevoUsuario(): IUsuarioNuevo {
    const f = this.usuarioForm.getRawValue();
    return {
      nombreUsuario: f.nombreUsuario ?? '',
      apellidosUsuario: f.apellidosUsuario ?? '',
      celularUsuario: f.celularUsuario ?? '',
      emailUsuario: f.emailUsuario ?? '',
      password: f.password ?? '',
      confirmarPassword: f.confirmarPassword ?? '',
      idUbicacion: f.idUbicacion ?? 0,
      idInmueble: f.idInmueble ?? 0,
      idRol: f.idRol ?? 0,
      idEstatus: 1,
      idTipoRelacion: f.idTipoRelacion ?? 1
    };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword ? null : { passwordMismatch: true };
  }
}