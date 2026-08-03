import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../../Constants/app.constants';
import { Observable } from 'rxjs';
import { IEgresoDTO } from '../DTO/IEgresoDTO';

@Injectable({
  providedIn: 'root',
})
export class Egresosservice {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = APP_CONSTANTS.URL_LOCAL;

getEgresos(year: number, month: number): Observable<IEgresoDTO[]> {
  const url = `${this._apiUrl}GetEgresos`;
  const params = new HttpParams()
    .set('year', year.toString())
    .set('month', month.toString());

  return this._http.get<IEgresoDTO[]>(url, { params });
}

agregarEgreso(egreso: IEgresoDTO): Observable<number> {
  const iegresoAddDTO = {
    fechaEgreso: egreso.fechaEgreso,
    beneficiario: egreso.beneficiario,
    concepto: egreso.concepto,
    monto: egreso.monto,
    observaciones: egreso.observaciones
  };  
  const url = `${this._apiUrl}AddEgreso`;
  return this._http.post<number>(url, iegresoAddDTO);  
}


}
