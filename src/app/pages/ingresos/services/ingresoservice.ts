import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IIngreso } from '../nuevoingreso/DTO/ingreso.model';

@Injectable({
  providedIn: 'root',
})
export class Ingresoservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  getIngresos(): Observable<any> {
    var url = this._apiUrl + 'GetIngresos';
    return this._http.get<IIngreso[]>(url);
  }
}
