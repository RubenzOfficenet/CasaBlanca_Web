export interface IEgresoDTO {
    Id : number,
    fechaEgreso : string,
    beneficiario : string,
    concepto : string,
    monto : number,
    observaciones : string
    totalMonto? : number
}