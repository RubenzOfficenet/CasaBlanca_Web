import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-nuevoingreso',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './nuevoingreso.html',
  styleUrl: './nuevoingreso.css',
})
export class Nuevoingreso {}
