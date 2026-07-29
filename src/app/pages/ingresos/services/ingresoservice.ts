import { HttpClient, HttpParams } from '@angular/common/http';
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

  getIngresos(year: number, month: number): Observable<any> {

    var url = this._apiUrl + 'GetIngresos';
    var params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this._http.get<IIngreso[]>(url, { params });
  }

  addIngreso(ingreso: IIngreso): Observable<IIngreso> {
    var url = this._apiUrl + 'AddIngreso'
    return this._http.post<IIngreso>(url, ingreso);
  }

  deleteIngreso(Id: number): Observable<number> {
    var url = this._apiUrl + 'DeleteIngreso/' + Id.toString();
    return this._http.delete<number>(url);
  }

}
