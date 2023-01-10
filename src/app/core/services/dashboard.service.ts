/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Appointment, PetType } from '../model/appointment.model';
import { Notifications } from '../model/notification.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class DashboardService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }
  getClientUpcomingAppointment(clientId, date): Observable<ApiResponse<{ appointment: Appointment; total: number}>> {
    const params = { clientId, date };
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.dashboard.getClientUpcomingAppointment, { params })
    .pipe(
      tap(_ => this.log('dashboard')),
      catchError(this.handleError('dashboard', []))
    );
  }
  getClientLatestAppointmentNotif(clientId): Observable<ApiResponse<Notifications>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.dashboard.getClientLatestAppointmentNotif + clientId)
    .pipe(
      tap(_ => this.log('dashboard')),
      catchError(this.handleError('dashboard', []))
    );
  }
  getClientLatestAnnouncements(clientId): Observable<ApiResponse<Notifications>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.dashboard.getClientLatestAnnouncements + clientId)
    .pipe(
      tap(_ => this.log('dashboard')),
      catchError(this.handleError('dashboard', []))
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
