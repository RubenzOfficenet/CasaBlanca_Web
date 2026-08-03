import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  // Inyección moderna con inject()
  public readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);

  confirmar(): void {
    // Retorna true al cerrar
    this.dialogRef.close(true);
  }

  cancelar(): void {
    // Retorna false al cerrar
    this.dialogRef.close(false);
  }
}