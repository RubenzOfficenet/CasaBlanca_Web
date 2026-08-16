import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

isSubmenuOpen = signal(false);

  toggleSubmenu(event: Event): void {
    event.preventDefault();
    this.isSubmenuOpen.update((open) => !open);
  }

}
