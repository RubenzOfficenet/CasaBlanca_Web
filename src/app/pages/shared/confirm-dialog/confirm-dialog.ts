
import {
  Component,
  input,
  output,
  signal
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {

  titulo = input('Confirmación');
  mensaje = input('¿Deseas continuar?');

  confirmado = output<void>();
  cancelado = output<void>();

  visible = signal(false);

  abrir(): void {
    this.visible.set(true);
  }

  cerrar(): void {
    this.visible.set(false);
  }

  confirmar(): void {
    this.confirmado.emit();
    this.cerrar();
  }

  cancelar(): void {
    this.cancelado.emit();
    this.cerrar();
  }

}
