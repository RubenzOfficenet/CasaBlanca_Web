import { ChangeDetectorRef, Component, Inject, inject, signal } from '@angular/core';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatSelect, MatOption, MatError } from '@angular/material/select';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuarioservice } from '../services/usuarioservice';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { IUbicacion } from '../../inmuebles/nuevoinmueble/DOT/IUbicacion.model';
import { ICasaRsponse } from '../../inmuebles/interface/casarequest.interface';
import { IRol } from '../../catalogo/interface/IRol.interfase.';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { MatButtonModule } from '@angular/material/button';
import { IUsuarioEdit } from '../nuevousuario/DTO/usuarioEdit.intggerface';
import { IUsuarioResponseDTO } from '../interface/UsuarioResponseDTO.interface';

export interface IUsuarioResponse {
  value: IUsuarioResponseDTO;
  statusCode: number;
}

@Component({
  selector: 'app-editarusuario',
  imports: [
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatRadioGroup,
    MatRadioButton,
    MatError,
    MatDialogActions,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './editarusuario.html',
  styleUrl: './editarusuario.css',
})
export class Editarusuario {
  private readonly fb = inject(FormBuilder);
  // private readonly dialogRef = inject(MatDialogRef<Editarusuario>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usuarioService = inject(Usuarioservice);
  private readonly catalogosService = inject(catalogosservice);
  private readonly inmueblesService = inject(InmueblesServices);
  private readonly dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Acceso directo a las propiedades recibidas
  readonly idUsuario: number = 0;

  usuarioData: IUsuarioResponseDTO | null = null;

  ubicaciones: IUbicacion[] = [];
  casalist: ICasaRsponse[] = [];
  roles: IRol[] = [];
  seccionSelected: number = 0;

  usuario = signal<IUsuarioEdit | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  usuarioForm = this.fb.group({
    nombreUsuario: ['', Validators.required],
    apellidosUsuario: ['', Validators.required],
    celularUsuario: [''],
    emailUsuario: ['', [Validators.required, Validators.email]],
    idUbicacion: [0, Validators.required],
    idInmueble: [-1, Validators.required],
    idRol: [-1, Validators.required],
    idTipoRelacion: [1, Validators.required],
  });

  nuevoUsuario: IUsuarioEdit = {
    id: 0,
    nombre: '',
    apellidos: '',
    email: '',
    celular: '',
    idEstatus: 0,
    estatus: '',
    idInmueble: 0,
    numeroCasa: '',
    idUbicacion: 0,
    nombreUbicacion: '',
    idRol: 0,
    rol: '',
    borrado: false,
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { idUsuario: number }, private dialogRef: MatDialogRef<Editarusuario> ) {}

  leeDatosUsuario(): void {
    this.usuarioService.getUsuarioById(this.data.idUsuario).subscribe({
      next: (response: IUsuarioResponseDTO) => {
        this.usuarioData = response;

        // Llenamos los datos básicos del formulario
        this.usuarioForm.patchValue({
          nombreUsuario: response.nombre,
          apellidosUsuario: response.apellidos,
          emailUsuario: response.email,
          celularUsuario: response.celular,
          idUbicacion: response.idUbicacion,
          idInmueble: response.idInmueble,
          idRol: response.idRol,
        });

        // Guardamos la sección seleccionada
        this.seccionSelected = response.idUbicacion;

        console.log('response: ', response);
        // Cargamos las casas de esa sección
        this.LeerCasasDeSeccion(response.idUbicacion, response.idInmueble);
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
      },
    });
  }

  ngOnInit(): void {
    this.cargarUbicaciones();
    this.leeRoles();
    this.leeDatosUsuario();
  }

  cargarUbicaciones(): void {
    this.inmueblesService.getUbicaciones().subscribe({
      next: (data) => {
        this.ubicaciones = data;
        console.log('Ubicaciones cargadas:', this.ubicaciones);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener ubicaciones:', err);
      },
    });
  }

leeRoles(): void {
  this.catalogosService.getRols().subscribe({
    next: (roles) => {
      this.roles = roles;
    },
    error: (err) => console.error(err),
  });
}

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword ? null : { passwordMismatch: true };
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }

  mostrarConfirmacion(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa los campos requeridos correctamente.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      return;
    }

    // Abrimos el modal con la API de MatDialog
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Usuario',
        mensaje: '¿Estás seguro de registrar este nuevo usuario?',
      },
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    // this.usuarioService.addUsuario().subscribe({
    //   next: (data) => {
    //     //console.log('Usuario agregado:', data);
    //     this.snackBar.open('Usuario registrado con éxito', 'OK', { duration: 3000 });
    //     this.dialogRef.close(data); // Cierra solo cuando el backend responde éxito
    //   },
    //   error: (err) => {
    //     console.error('Error al agregar usuario:', err);
    //     this.snackBar.open(
    //       'Error al agregar usuario. Por favor, inténtalo de nuevo.',
    //       'Cerrar',
    //       { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
    //     );
    //   }
    //});
  }

  onUbicacionChange(idUbicacion: number): void {
    console.log(idUbicacion);

    const ubicacionSeleccionada = this.ubicaciones.find((u) => u.id === idUbicacion);
    this.seccionSelected = Number(ubicacionSeleccionada?.id);

    // 1. Limpiamos o reseteamos el valor del inmueble
    this.usuarioForm.patchValue({
      idInmueble: null, // Se recomienda null o '' en lugar de 0 si no existe un id = 0
    });

    // 2. Cargamos las casas correspondientes
    if (this.seccionSelected) {
      this.LeerCasasDeSeccion(this.seccionSelected, null);
    }
  }

LeerCasasDeSeccion(idSeccion: number, idInmueble: number | null): void {
  this.inmueblesService.leeCasasporSeccion(idSeccion).subscribe({
    next: (respuesta: ICasaRsponse[]) => {

      this.casalist = respuesta;

      console.log('Casas cargadas:', this.casalist);
      console.log('Inmueble:', idInmueble);

      // Si estamos editando un usuario y tenemos inmueble,
      // lo seleccionamos.
      if (idInmueble !== null) {
        this.usuarioForm.patchValue({
          idInmueble: idInmueble
        });
      }

      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error al leer las casas:', error);

      this.snackBar.open(
        'Error al leer las casas de la sección',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    }
  });
}


}
