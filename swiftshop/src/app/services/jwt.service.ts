import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() { }

  // Store JWT token in local storage
  storeToken(access_token: string): void {
    localStorage.setItem('token', access_token);
  }

  // Retrieve JWT token from local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Remove JWT token from local storage
  removeToken(): void {
    localStorage.removeItem('token');
  }
}