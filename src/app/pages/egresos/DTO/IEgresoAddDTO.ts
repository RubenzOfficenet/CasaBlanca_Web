export interface IEgresoAddDTO {
    fechaEgreso : string,
    beneficiario : string,
    concepto : string,
    monto : number,
    observaciones : string
    totalMonto? : number
}