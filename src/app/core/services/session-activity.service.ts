import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class SessionActivityService {
  sessionInterval: any;
  isSessionExpired = false;
  sessionTimeout = 0;
  constructor(
    private appconfig: AppConfigService,
    private router: Router,
    private alertController: AlertController,
    private storageService: StorageService
  ) {
    this.sessionTimeout = Number(
      this.appconfig.config.sessionConfig.sessionTimeout
    );
  }

  start() {
    this.stop();
    this.isSessionExpired = false;
    this.sessionInterval = setInterval(() => {
      this.checkSessionExpredDate();
    }, 1000);
  }

  stop() {
    clearInterval(this.sessionInterval);
    this.isSessionExpired = true;
  }

  async checkSessionExpredDate() {
    if (this.storageService.getSessionExpiredDate()) {
      const today: any = new Date();
      const sessionExpiredDate: any = new Date(
        this.storageService.getSessionExpiredDate()
      );
      const diffTime = today - sessionExpiredDate;
      if (diffTime > 0) {
        this.stop();
        await this.presentAlert({
          title: 'Session expired',
          message: 'Your session expired',
          backdropDismiss: false,
          buttons: [
            {
              text: 'SIGN OUT',
              handler: () => {
                this.handleLogout();
              },
            },
            {
              text: 'EXTEND SESSION',
              handler: () => {
                this.resetSession();
                this.start();
              },
            },
          ],
        });
      }
    } else {
    }
  }

  handleLogout() {
    this.stop();
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }

  resetSession() {
    console.log('reset');
    const today = new Date();
    today.setTime(today.getTime() + this.sessionTimeout * 1000);
    this.storageService.saveSessionExpiredDate(today);
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
