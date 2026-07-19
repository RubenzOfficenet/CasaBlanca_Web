import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IGetUsuariosResponse } from '../interface/iusuario.interface';
import { IUsuarioNuevo } from '../nuevousuario/DTO/usuarioto.model';


@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  constructor() { }

  getUsuarios(): Observable<IGetUsuariosResponse[]> {
    var url = this._apiUrl + 'Users';
    debugger; 
    return this._http.get<IGetUsuariosResponse[]>(url);
  }

  addUsuario(usuario: IUsuarioNuevo): Observable<any> {
    var url = this._apiUrl + 'NewUser';
    return this._http.post<IUsuarioNuevo>(url, usuario);
  }

}
