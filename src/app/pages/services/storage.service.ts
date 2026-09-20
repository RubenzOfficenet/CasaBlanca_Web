import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Guardar un valor (soporta strings u objetos)
setItem(key: string, value: any): void {
  // 1. Verificación de entorno de navegador (para evitar errores en SSR)
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  // 2. Si el valor ya es un string, se guarda directo; si es objeto/número/booleano, se serializa a JSON
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  window.localStorage.setItem(key, stringValue);
}

  // Obtener un valor
  getItem<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  // Eliminar una clave
  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  // Limpiar todo el almacenamiento
  clear(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

}
