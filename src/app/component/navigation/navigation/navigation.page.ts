/* eslint-disable @typescript-eslint/member-ordering */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SessionActivityService } from 'src/app/core/services/session-activity.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/push-notifications';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss'],
})
export class NavigationPage implements OnInit, OnDestroy {
  currentUser: LoginResult;
  active = '';
  // totalUnreadNotification = 0;
  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private alertController: AlertController,
    private sessionActivityService: SessionActivityService,
    private notificationService: NotificationService) {
      this.currentUser = this.storageService.getLoginUser();
    }

  get totalUnreadNotification() {
    const total = this.storageService.getTotalUnreadNotif();
    return total? total : 0;
  }


  ngOnInit() {
    //start session
    if (Capacitor.platform !== 'web') {
      this.registerPush();
    }
    this.sessionActivityService.stop();
    this.sessionActivityService.start();
  }
  ngOnDestroy() {
    //stop session
    this.sessionActivityService.stop();
  }

  ionViewWillLeave(){
  }

  onTabsWillChange(event) {
    this.active = event.tab;
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
        this.userService.updateFirebaseToken({
          userId: this.currentUser.userId,
          firebaseToken: token.value
        });
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

  // eslint-disable-next-line @typescript-eslint/member-ordering
@HostListener('click', ['$event.target']) onClick(e) {
    if(!this.sessionActivityService.isSessionExpired) {
      this.sessionActivityService.stop();
      this.sessionActivityService.resetSession();
      this.sessionActivityService.start();
    }
  }

}
