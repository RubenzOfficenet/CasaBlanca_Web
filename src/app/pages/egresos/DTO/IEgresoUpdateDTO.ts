export interface IEgresoUpdateDTO {
    fechaEgreso : string,
    beneficiario : string,
    concepto : string,
    monto : number,
    observaciones : string
    totalMonto? : number 
}
    