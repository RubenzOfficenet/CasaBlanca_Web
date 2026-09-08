import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ICasas } from '../../../Models/inmueble.model';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { CasaDTO } from './DTO/casaDTO.model';
import { ConceptoIngreso } from './DTO/conceptoIngresos.model';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { IIngresoDTO } from './DTO/ingresoDTO.model';
import { IngresosService } from './services/ingresoService';
import { ICatalogocasas } from '../../inmuebles/interface/icatalogocasas.interface';

@Component({
  selector: 'app-nuevoingreso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevoingreso.html',
  styleUrl: './nuevoingreso.css',
})
export class Nuevoingreso implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inmueblesServices = inject(InmueblesServices);
  private readonly conceptoIngresosService = inject(catalogosservice);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ingresoService = inject(IngresosService);
  private readonly dialogRef = inject(MatDialogRef<Nuevoingreso>);
  private readonly dialog = inject(MatDialog);

  casas: ICatalogocasas[] = [];
  casaDatos: CasaDTO[] = [];
  casasFiltradas: CasaDTO[] = [];
  conceptoIngreso: ConceptoIngreso[] = [];

casaControl = new FormControl<string>('', { nonNullable: true });

  ingresoForm: FormGroup = this.fb.group({
    casa: [null, Validators.required],
    nombre: [{ value: '', disabled: true }],
    fechaRecepcion: ['', Validators.required], // Se inicializa vacío para no romper el Change Detection
    numeroRecibo: ['', Validators.required],
    concepto: [null, Validators.required],
    fechaConcepto: ['', Validators.required],
    monto: [null, [Validators.required, Validators.min(0.01)]],
    observaciones: ['']
  });

constructor(private cdRef: ChangeDetectorRef) {
  this.casaControl.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe((texto) => {
      const valor = texto ?? '';
      this.filtrarCasas(valor);

      // Verificamos si realmente cambió antes de hacer patchValue
      if (!valor.trim() && this.ingresoForm.get('casa')?.value !== null) {
        this.ingresoForm.patchValue({ casa: null, nombre: '' }, { emitEvent: false });
      }
    });
}


ngOnInit(): void {
  setTimeout(() => {
    this.ingresoForm.patchValue({
      fechaRecepcion: this.obtenerFechaActual()
    });
    this.leerConceptoIngreso();
    this.leerDatosCasa();
  });
}

  filtrarCasas(texto: string): void {
    const busqueda = texto.toLowerCase().trim();
    this.casasFiltradas = this.casaDatos.filter((casa) =>
      casa.casa.toLowerCase().includes(busqueda)
    );
  }


  onCasaChange(): void {
    const idSeleccionado = this.ingresoForm.get('casa')?.value;
    const casaEncontrada = this.casaDatos.find(c => c.id === idSeleccionado);

    if (casaEncontrada) {
      this.seleccionarCasa(casaEncontrada);
    }
  }

  seleccionarCasa(casa: CasaDTO): void {
    this.ingresoForm.get('casa')?.setValue(casa.id);
    this.casaControl.setValue(casa.casa, { emitEvent: false });
  }

  leerConceptoIngreso(): void {
    this.conceptoIngresosService.getConceptoIngresos().subscribe({
      next: (respuesta: ConceptoIngreso[]) => {
        this.conceptoIngreso = respuesta;
      },
      error: (error) => {
        console.error('Error al obtener los conceptos de ingreso:', error);
      }
    });
  }



leerDatosCasa(): void {
  this.inmueblesServices.getInmuebles().subscribe({
    next: (respuesta: ICatalogocasas[]) => {
      this.casas = respuesta;
      this.casaDatos = this.casas.map((casa) => this.mapToCasaDTO(casa));
      this.casasFiltradas = [...this.casaDatos];
    },
    error: (error) => {
      console.error('Error al obtener las casas:', error);
    }
  });
}

  mostrarConfirmacion(): void {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa todos los campos requeridos.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Registrar Ingreso',
        mensaje: '¿Estás seguro de guardar este nuevo ingreso?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    const datos = this.ingresoForm.getRawValue();

    const ingresoDto: IIngresoDTO = {
      idCasa: datos.casa,
      fechaRecepcion: datos.fechaRecepcion,
      numeroRecibo: datos.numeroRecibo,
      idConcepto: datos.concepto,
      fechaConcepto: datos.fechaConcepto,
      monto: Number(datos.monto),
      observaciones: datos.observaciones
    };

    this.ingresoService.agregaIngreso(ingresoDto).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Ingreso registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta);
      },
      error: (error) => {
        console.error('Error al crear el ingreso:', error);
        this.snackBar.open(
          'Error al registrar el ingreso. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }

  campoInvalido(campo: string): boolean {
    const control = this.ingresoForm.get(campo);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  private obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private mapToCasaDTO(casa: ICatalogocasas): CasaDTO {
    return {
      id: casa.id,
      casa: casa.numeroCasa ?? ''
    };
  }
}