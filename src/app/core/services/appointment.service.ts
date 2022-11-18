import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Appointment } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements IServices {
  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  getClientAppointmentsByStatus(params: any): Observable<ApiResponse<Appointment[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.appointment.getClientAppointmentsByStatus,
        {params}
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  getById(appointmentId: string): Observable<ApiResponse<Appointment>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.getById +
          appointmentId
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createClientAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createClientAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createClientCashlessAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createClientCashlessAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  rescheduleAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.rescheduleAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  updateAppointmentStatus(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.updateAppointmentStatus,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(
        `${operation} failed: ${
          Array.isArray(error.error.message)
            ? error.error.message[0]
            : error.error.message
        }`
      );
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
