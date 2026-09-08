import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { map, Observable } from 'rxjs';
import { IGetUsuariosResponse } from '../interface/iusuario.interface';
import { IUsuarioNuevo } from '../nuevousuario/DTO/usuarioto.model';
import { IUsuarioResponseDTO } from '../interface/UsuarioResponseDTO.interface';

export interface IUsuarioResponse {
  value: IUsuarioResponseDTO;
  statusCode: number;
}

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  constructor() { }

  getUsuarios(): Observable<IGetUsuariosResponse[]> {
    var url = this._apiUrl + 'GetAllUsers';
    return this._http.get<IGetUsuariosResponse[]>(url);
  }

  addUsuario(usuario: IUsuarioNuevo): Observable<any> {
    debugger;
    var url = this._apiUrl + 'CreateUser';
    return this._http.post<IUsuarioNuevo>(url, usuario);
  }

  getUsuarioById(id: number): Observable<IUsuarioResponseDTO> {
    var url = this._apiUrl + 'GetUserById/' + id;
    return this._http.get<IUsuarioResponse>(url).pipe(map(response => response.value));
  }


}
