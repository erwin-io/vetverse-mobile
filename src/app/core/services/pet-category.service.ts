import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { PetCategory } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class PetCategoryService {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<PetCategory[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petCategory)
    .pipe(
      tap(_ => this.log('petCategory')),
      catchError(this.handleError('petCategory', []))
    );
  }

  getById(petCategoryId: string): Observable<ApiResponse<PetCategory>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petCategory + petCategoryId)
    .pipe(
      tap(_ => this.log('petCategory')),
      catchError(this.handleError('petCategory', []))
    );
  }

  add(data: any): Observable<ApiResponse<PetCategory>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petCategory, data)
    .pipe(
      tap(_ => this.log('petCategory')),
      catchError(this.handleError('petCategory', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<PetCategory>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petCategory, data)
    .pipe(
      tap(_ => this.log('petCategory')),
      catchError(this.handleError('petCategory', []))
    );
  }

  delete(petCategoryId: string): Observable<ApiResponse<PetCategory>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.petCategory + petCategoryId)
    .pipe(
      tap(_ => this.log('petCategory')),
      catchError(this.handleError('petCategory', []))
    );
  }

   handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
