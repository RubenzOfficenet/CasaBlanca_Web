import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IIngreso } from '../DTO/ingreso.model';
import { IIngresoDTO } from '../DTO/ingresoDTO.model';

@Injectable({
  providedIn: 'root',
})
export class IngresosService {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;



  constructor() { }

  addCasa(): Observable<IIngreso[]> {
    var url = this._apiUrl + 'GelAllRol';
    return this._http.get<IIngreso[]>(url);
  }


  leeDatosCasa(): Observable<IIngreso> {
    var url = this._apiUrl + 'GetHouses'
    return this._http.get<IIngreso>(url);
  }

agregaIngreso(ingresoDTO: IIngresoDTO): Observable<number> {
  const url = this._apiUrl + 'AddIngreso';
  return this._http.post<number>(url, ingresoDTO);
}

}
