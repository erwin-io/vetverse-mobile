import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { LoginResult } from '../model/loginresult.model';
import { StorageService } from '../storage/storage.service';
import { UserService } from './user.service';
import { Capacitor } from '@capacitor/core';
@Injectable({
  providedIn: 'root'
})
export class FcmService {
  currentUser: LoginResult;
  constructor(
    private storageService: StorageService,
    private userService: UserService) {
      this.currentUser = this.storageService.getLoginUser();
    }

  init() {
    if (Capacitor.platform !== 'web') {
      this.registerFCM();

      PushNotifications.createChannel({
       id: 'fcm_default_channel',
       name: 'Vetverse',
       importance: 5,
       visibility: 1,
       lights: true,
       vibration: true,
       sound: 'notif_alert'
     });
    }
  }

  registerFCM(){
    this.currentUser = this.storageService.getLoginUser();
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
        console.log('registerd! token', token.value);
        console.log('saving token to user', this.currentUser.userId);
        this.userService.updateFirebaseToken({
          userId: this.currentUser.userId,
          firebaseToken: token.value
        }).subscribe((res)=> {
          console.log('saved! to user', this.currentUser.userId);
          console.log(res);
        }, (err)=>{console.log(err)});
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
        }
      }
    );
  }



  delete() {
    if (Capacitor.platform !== 'web') {
      // Remove FCM instance
      FCM.deleteInstance()
        .then(() => console.log(`Token deleted`))
        .catch((err) => console.log(err));
    }
  }


}
