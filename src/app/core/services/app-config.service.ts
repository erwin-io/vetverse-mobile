import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { Injectable, APP_INITIALIZER } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private static readonly configPath = './assets/config/config.json';

  private appConfig: any;
  constructor(private http: HttpClient) {
  }

  public loadAppConfig() {
    return new Promise((resolve)=> {
      this.http.get(AppConfigService.configPath)
      .pipe(
        take(1),
        catchError((err) =>throwError(err || 'Server error') )
      )
      .subscribe((configResponse: object) => {
        this.appConfig = configResponse;
        resolve(true);
      });
    });

  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get config(): any {
    return this.appConfig;
  }
}
