import { Component, inject, signal, ViewChild } from '@angular/core';
import { IGetUsuariosResponse } from './interface/iusuario.interface';
import { Usuarioservice } from './services/usuarioservice';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { Nuevousuario } from '../usuarios/nuevousuario/nuevousuario';
import { MatDialog } from '@angular/material/dialog';
import { Editarusuario } from './editarusuario/editarusuario';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  imports: [
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  private readonly snackBar = inject(MatSnackBar);

  private readonly usuarioService = inject(Usuarioservice);
  private readonly dialog = inject(MatDialog);

  isLoading = true;
  displayedColumns: string[] = [
    'nombre',
    'apellidos',
    'email',
    'celular',
    'estatus',
    'numeroCasa',
    'nombreUbicacion',
    'rol',
    'acciones',
  ];

  columnLabels: any = {
    nombreUsuario: 'Nombre',
    apellidosUsuario: 'Apellidos',
    emailUsuario: 'Correo',
    celularUsuario: 'Celular',
    rol: 'Rol',
    numeroCasa: 'Casa',
    estatus: 'Estatus',
    acciones: 'Acciones',
  };

  dataSource = new MatTableDataSource<IGetUsuariosResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  casas = signal<IGetUsuariosResponse[]>([]);
  totalRegistros?: number;
  data?: IGetUsuariosResponse;

  constructor() {
    this.data = {
      id: 0,
      nombre: '',
      apellidos: '',
      email: '',
      celular: '',
      idRol: 0,
      idCasa: 0,
      idEstatus: 1,
      estatus: '',
      idUbicacion: 0,
      nombreUbicacion: '',
      numeroCasa: '',
      rol: '',
      idTipoRelacion: 0,
      tipoRelacion: '',
    };
  }

  abrirPopup() {
    const dialogRef = this.dialog.open(Nuevousuario, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        debugger;
        //console.log('Datos recibidos del popup:', result);
        this.cargaUsuarios();
      } else {
        //console.log('El usuario canceló');
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (data: IGetUsuariosResponse, filter: string): boolean => {
      const normalizedFilter = filter.trim().toLowerCase();

      return (
        (data.nombre?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.apellidos?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.email?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.celular?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.numeroCasa?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.nombreUbicacion?.toLowerCase().includes(normalizedFilter) ?? false) ||
        (data.rol?.toLowerCase().includes(normalizedFilter) ?? false)
      );
    };

    this.cargaUsuarios();
  }

  cargaUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        console.log('Datos de usuarios recibidos:', data);
        this.dataSource.data = data; // ✅ Actualizas los datos sin recrear el dataSource
        this.totalRegistros = data.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar los usuarios:', err);
      },
    });
  }

  editarUsuario(idUsuario: number) {
    //console.log('Id : ', idUsuario);
    const dialogRef = this.dialog.open(Editarusuario, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '600px',
      data: { idUsuario: idUsuario },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        debugger;
        //console.log('Datos recibidos del popup:', result);
        this.cargaUsuarios();
      } else {
        //console.log('El usuario canceló');
      }
    });
  }

  borrarUsuario(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '380px',
      disableClose: true,
      data: {
        titulo: 'Borrar usuario',
        mensaje: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
        textoConfirmar: 'Sí, borrar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmado: boolean) => {
      if (confirmado) {
        try {
          debugger;
          const respuesta = await firstValueFrom(this.usuarioService.deleteUsuario(id));
          console.log('Respuesta del servidor:', respuesta);

          this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });

          // Refresca la tabla de usuarios
          this.cargaUsuarios();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);

          this.snackBar.open('Ocurrió un error al eliminar el usuario', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        }
      }
    });1
  }




}
