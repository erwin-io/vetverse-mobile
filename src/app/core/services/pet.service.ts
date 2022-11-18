/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorException, ExceptionCode } from '@capacitor/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Pet } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class PetService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) {

  }

  get(): Observable<ApiResponse<Pet[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.get)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  getByClientId(clientId: string): Observable<ApiResponse<Pet[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.getByClientId + clientId)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  getById(petId: string): Observable<ApiResponse<Pet>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.getById + petId)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  add(data: any): Observable<ApiResponse<Pet>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.create, data)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Pet>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.update, data)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  delete(petId: string): Observable<ApiResponse<Pet>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet.delete + petId)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
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
