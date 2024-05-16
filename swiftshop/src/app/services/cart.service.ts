import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
    providedIn: 'root'
})

export class CartService {

    private apiUrl = 'http://127.0.0.1:5000';

    constructor(private http: HttpClient, private jwtService : JwtService) { }

    getMyCart(): Observable<any> {
        const token = this.jwtService.getToken()
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(`${this.apiUrl}/viewcart`, { headers }).pipe(
          catchError(error => {
            let errorMessage = 'An unknown error occurred';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            return throwError(errorMessage);
          })
        );
    }

    deleteItem(ItemID: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/deletefromcart/${ItemID}`).pipe(
          catchError(error => {
            let errorMessage = 'An unknown error occurred';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            return throwError(errorMessage);
          })
        );
    }

    changeQuantity(ItemID: number, Quantity: number): Observable<any> {
        const token = this.jwtService.getToken()
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const data = { Quantity }
        return this.http.post<any>(`${this.apiUrl}/changequantity/${ItemID}`, data, { headers }).pipe(
          catchError(error => {
            let errorMessage = 'An unknown error occurred';
            if (error.error && error.error.error) {
              errorMessage = error.error.error;
            }
            return throwError(errorMessage);
          })
        );
    }

    placeOrders(): Observable<any> {
      const token = this.jwtService.getToken()
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.apiUrl}/placeorder`, null, { headers }).pipe(
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