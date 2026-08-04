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
import { Nuevousuario } from '../usuarios/nuevousuario/nuevousuario'
import { IUsuario } from './nuevousuario/interface/iusuario';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-usuarios',
  imports: [MatButtonModule, CommonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatIconModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  isLoading = true; // al inicio está cargando
  displayedColumns: string[] = [
    'nombreUsuario',
    'apellidosUsuario',
    'emailUsuario',
    'celularUsuario',
    'rol',
    'numeroCasa',
    'estatus',
    'acciones'
  ];


  columnLabels: any = {
    nombreUsuario: 'Nombre',
    apellidosUsuario: 'Apellidos',
    emailUsuario: 'Correo',
    celularUsuario: 'Celular',
    rol: 'Rol',
    numeroCasa: 'Casa',
    estatus: 'Estatus',
    acciones: 'Acciones'
  };


  dataSource = new MatTableDataSource<IGetUsuariosResponse>([]);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  casas = signal<IGetUsuariosResponse[]>([]);
  totalRegistros?: number;
  data?: IUsuario;

  constructor(private usuarioService: Usuarioservice, private dialog: MatDialog) {
    this.data = {
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

  abrirPopup() {
    const dialogRef = this.dialog.open(Nuevousuario, {
      width: '40vw',
      maxWidth: '2000px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
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

      return (data.nombreUsuario?.toLowerCase().includes(normalizedFilter) ?? false)
        || (data.apellidosUsuario?.toLowerCase().includes(normalizedFilter) ?? false)
        || (data.estatus?.toLowerCase().includes(normalizedFilter) ?? false)
        || (data.numeroCasa?.toLowerCase().includes(normalizedFilter) ?? false);
    };

    this.cargaUsuarios();
  }

  cargaUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data : any) => {
        //console.log('Datos de usuarios recibidos:', data);
        this.dataSource.data = data;   // ✅ Actualizas los datos sin recrear el dataSource
        this.totalRegistros = data.length;
        this.isLoading = false;
        //console.log("Se cargaron los datos de los usuarios");

      },
      error: (err: any) => {
        console.error('Error al cargar los usuarios:', err);
      }
    });
  }


  editarUsuario(id: number) { }
  
  eliminar(id: number) { }




}
