import { environment } from '@envs/environment';
//import { ChequeaPlataformaService } from './../utiles/chequea-plataforma.service';
import { inject, Injectable, signal } from '@angular/core';
//import { decrypt, encrypt } from '@util/encriptador';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  //private chequeaPlataformaService = inject(ChequeaPlataformaService);
  loading = signal(false);

  get<T>(key: string): T | null {
    //  if (this.chequeaPlataformaService.chequeaSiBrowser()) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      //  if (environment.production) return decrypt<T>(value) as T;

      return JSON.parse(value) as T;
    }
    //}
    return null;
  }

  set(key: string, value: any): void {
    // if (this.chequeaPlataformaService.chequeaSiBrowser()) {
    let data = JSON.stringify(value);
    console.log('environment.production:', environment.production);
    if (environment.production) {
      //   data = encrypt(data);
    }
    localStorage.setItem(key, data);
    //}
  }

  remueve(key: string): void {
    // if (this.chequeaPlataformaService.chequeaSiBrowser()) {
    localStorage.removeItem(key);
    // }
  }
}
