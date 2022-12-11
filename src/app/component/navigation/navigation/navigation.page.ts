import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SessionActivityService } from 'src/app/core/services/session-activity.service';
import { StorageService } from 'src/app/core/storage/storage.service';

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


  // eslint-disable-next-line @typescript-eslint/member-ordering
@HostListener('click', ['$event.target']) onClick(e) {
    if(!this.sessionActivityService.isSessionExpired) {
      this.sessionActivityService.stop();
      this.sessionActivityService.resetSession();
      this.sessionActivityService.start();
    }
  }
}
