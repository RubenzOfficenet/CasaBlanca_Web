import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IResumenanalitico } from '../intgerface/iresumenanalitico.interface';

@Injectable({
  providedIn: 'root',
})
export class Resumenanaliticoservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  getRefsumenAnalitico(): Observable<IResumenanalitico[]> {
    var url = this._apiUrl + 'GetRersumenAnalitico';
    return this._http.get<IResumenanalitico[]>(url);
  }


} // end class
