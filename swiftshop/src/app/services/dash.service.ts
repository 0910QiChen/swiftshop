import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
    providedIn: 'root'
})

export class DashService {

    private apiUrl = 'http://127.0.0.1:5000';

    constructor(private http: HttpClient, private jwtService: JwtService) { }

    addToCart(ItemID: number, Quantity: number): Observable<any> {
        const token = this.jwtService.getToken()
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const data = { ItemID, Quantity }
        return this.http.post<any>(`${this.apiUrl}/addtocart`, data, { headers }).pipe(
          catchError(error => {
            let errorMessage = 'You must login in order to add to cart';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            return throwError(errorMessage);
          })
        );
    }

    getItems(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getitems`).pipe(
          catchError(error => {
            let errorMessage = 'An unknown error occurred';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            return throwError(errorMessage);
          })
        );
    }
}