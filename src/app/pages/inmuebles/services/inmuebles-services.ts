import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { ICasas } from '../../../Models/inmueble.model';
import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { ICasaCreate } from '../interface/icasa.interfase';
import { InmuebleEditarDTO } from '../../../Models/InmuebleEditarDTO.model';
import { type iupdateCasa } from '../interface/iupdateCasa';

@Injectable({
  providedIn: 'root',
})
export class InmueblesServices {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

  constructor() { }

  getInmuebles(): Observable<ICasas[]> {
    var url = this._apiUrl + 'GetHouses';
    return this._http.get<ICasas[]>(url);
  }

  getEstadosOcupacion(): Observable<IEstadosOcupacion[]> {
    var url = this._apiUrl + 'GetEstadosOcupacion';
    return this._http.get<IEstadosOcupacion[]>(url);
  }


  postCreateHouse(inmueble: ICasaCreate): Observable<any> {
    var url = this._apiUrl + 'CreateHouse';
    return this._http.post<any>(url, inmueble);
  }

  getInuebleById(id: number): Observable<InmuebleEditarDTO> {
    var url = this._apiUrl + 'GetHouseById/' + id;
    return this._http.get<any>(url);
  }

  postUpdateHouse(datos: iupdateCasa)
  {
    debugger;
    var url = this._apiUrl + 'UpdateHouse/';
    return this._http.post<any>(url, datos);
  }


}
