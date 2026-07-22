import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONSTANTS } from '../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IRol } from '../../pages/catalogo/interface/IRol.interfase.';
import { ConceptoIngreso } from '../../pages/ingresos/nuevoingreso/DTO/conceptoIngresos.model';


@Injectable({
  providedIn: 'root',
})
export class catalogosservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;


  constructor() { }

  getRols(): Observable<IRol[]> {
    var url = this._apiUrl + 'GelAllRol';
    return this._http.get<IRol[]>(url);
  }

  getConceptoIngresos() : Observable<ConceptoIngreso[]> {
    var url = this._apiUrl + 'GetConceptoIngreso';
    return this._http.get<ConceptoIngreso[]>(url);
  }


}
