import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Nuevoingreso } from './nuevoingreso/nuevoingreso';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ingresos',
  imports: [MatButtonModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatDialogModule, MatIconModule ],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos {

constructor(private dialog: MatDialog) {}

abrirPopup() {
    const dialogRef = this.dialog.open(Nuevoingreso, {
      width: '40vw',       // 80% del ancho de la pantalla (Viewport Width)
      maxWidth: '2000px',   // No crecerá más de 800px
      minWidth: '320px',   // No se encogerá a menos de 320px
      disableClose: false, // Evita que se cierre al hacer clic fuera o presionar Escape
      hasBackdrop: true 
    });

    // Capturar el resultado cuando se cierre
    dialogRef.afterClosed().subscribe(result => {
      console.log('El pop-up se cerró. Resultado:', result);
      if (result === true) {
        // El usuario hizo clic en "Aceptar"
      }
    });
  }

}
