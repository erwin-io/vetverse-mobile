/* eslint-disable max-len */
import { Component, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/push-notifications';
import { StorageService } from './core/storage/storage.service';
import { Capacitor } from '@capacitor/core';
import { UserService } from './core/services/user.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private androidPermissions: AndroidPermissions,
    @Optional() private routerOutlet?: IonRouterOutlet
  ) {

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => console.log('Has permission?',result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );

    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
    this.platform.ready().then(() => {

      // Trigger the push setup
      this.initPush();
    });

    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  //   LocalNotifications.schedule({
  //     notifications: [
  //         {
  //             title: 'Vetverse',
  //             body: 'body here',
  //             id: 1,
  //             sound: 'android.resource://io.ionic.starter/raw/notif_call_waiting.wav',
  //             ongoing: true
  //         }
  //     ]
  // });
  }


  initPush() {
    if (Capacitor.platform !== 'web') {
      this.registerPush();
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
  private registerPush() {
    PushNotifications.requestPermissions().then((permission) => {
      PushNotifications.register();
      if (permission.receive) {
        // Register with Apple / Google to receive push via APNS/FCM
      } else {
        // No permission for push granted
      }
    });

    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) => {
        console.log('My token: ' + JSON.stringify(token));
        this.userService.updateFirebaseToken({});
      }
    );

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification));

      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: PushNotificationActionPerformed) => {
        const data = notification.notification.data;
        console.log('Action performed: ' + JSON.stringify(notification.notification));
        if (data.detailsId) {
          // this.router.navigateByUrl(`/home/${data.detailsId}`);
          this.presentAlert(data);
        }
      }
    );
  }
}
