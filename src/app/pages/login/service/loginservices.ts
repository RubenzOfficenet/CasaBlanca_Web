import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { map, Observable } from 'rxjs';
import { LoginRespondeDTO } from '../interface/loginResponse.interface';
import { ApiResponse } from '../../shared/apiResponse.interface';
import { UpdateUserInterface } from '../interface/updateUserPassword.interface';
import { UsuarioUpdatePasswordResponse } from '../interface/UsuarioUpdatePasswordResponse.interface';



@Injectable({
  providedIn: 'root',
})
export class Loginservices {


  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  getPassword(email: string, password: string): Observable<LoginRespondeDTO> {
    var url = `${this._apiUrl}GetUserByEmailAndPassword?email=${email}&password=${password}`;
    return this._http.get<LoginRespondeDTO>(url);

  }

  updatePassword(usuarioUpdatePassword: UpdateUserInterface): Observable<UsuarioUpdatePasswordResponse> {
    const url = this._apiUrl + 'UpdatePassword';
    console.log(url);
    return this._http.put<UsuarioUpdatePasswordResponse>(url, usuarioUpdatePassword);
  }
}
