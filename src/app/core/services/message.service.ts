import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Messages } from '../model/message.model';
import { CustomSocket } from '../sockets/custom-socket.sockets';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private socket: CustomSocket, private http: HttpClient, private appconfig: AppConfigService) { }

  getByAppointmentPage(params): Observable<ApiResponse<{
    items: Messages[];meta: { totalItems: number;currentPage: number;itemCount: number};
  }>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.message.findByAppointmentPage,
      {params})
    .pipe(
      tap(_ => this.log('message')),
      catchError(this.handleError('message', []))
    );
  }

  add(data: any): Observable<ApiResponse<Messages>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.message.create,
        data
      )
      .pipe(
        tap((_) => this.log('message')),
        catchError(this.handleError('message', []))
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
