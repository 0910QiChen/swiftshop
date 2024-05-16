import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { JwtService } from './jwt.service';

@Injectable({
    providedIn: 'root'
})

export class OrderService {

    private apiUrl = 'http://127.0.0.1:5000';

    constructor(private http: HttpClient, private jwtService : JwtService) { }

    loadTrackingNumber(): Observable<any> {
        const token = this.jwtService.getToken()
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(`${this.apiUrl}/tracking`, { headers }).pipe(
            catchError(error => {
                let errorMessage = 'An unknown error occurred';
                if (error.error && error.error.error) {
                  errorMessage = error.error.error;
                }
                return throwError(errorMessage);
              })
        );
    }

    showLog(TrackingNumber: string): Observable<any> {
        const token = this.jwtService.getToken()
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const data = { TrackingNumber }
        return this.http.post<any>(`${this.apiUrl}/orderhistory`, data, { headers }).pipe(
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