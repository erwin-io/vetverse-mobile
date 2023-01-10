/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { Appointment } from 'src/app/core/model/appointment.model';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { Notifications } from 'src/app/core/model/notification.model';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../core/storage/storage.service';
import { ScheduleDetailsPage } from '../schedule/schedule-details/schedule-details.page';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isLoading;
  upcomingAppointment: Appointment = new Appointment();
  latestAppointmentNotif: Notifications;
  latestAnnouncements: Notifications;
  totalUnreadNotification = 0;
  totalUpcoming = 0;
  hasChanges = false;
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private alertController: AlertController,
  ) {
    const currentUser = this.storageService.getLoginUser();
    this.initDashboard(currentUser.clientId);
  }

  get user() {
    return this.storageService.getLoginUser();
  }

  async initDashboard(clientId){
    const date = moment().format('YYYY-MM-DD');
    this.isLoading = true;
    forkJoin(
      this.dashboardService.getClientUpcomingAppointment(clientId, date),
      this.dashboardService.getClientLatestAppointmentNotif(clientId),
      this.dashboardService.getClientLatestAnnouncements(clientId),
      this.notificationService.getTotalUnreadByClientId({clientId})
  ).subscribe(
      ([getUpcomingAppointment, getLatestAppointmentNotif, getLatestAnnouncements, getTotalUnread]) => {
          // do things
          this.upcomingAppointment = getUpcomingAppointment.data.appointment;
          this.totalUpcoming = getUpcomingAppointment.data.total;
          this.latestAppointmentNotif = getLatestAppointmentNotif.data;
          this.latestAnnouncements = getLatestAnnouncements.data;
          this.totalUnreadNotification = getTotalUnread.data.total;
          this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
          console.log(getUpcomingAppointment.data);
          console.log(getLatestAppointmentNotif.data);
          console.log(getLatestAnnouncements.data);
          console.log(getTotalUnread.data);
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
        this.hasChanges = false;
      }
  );
  }

  ngOnInit() {
  }

  async onShowSettings() {
    // this.router.navigate(['settings'], { replaceUrl: true });

    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: SettingsPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      componentProps: { modal },
    });
    modal.present();
    console.log('open settings');
  }

  async onOpenDetails(details) {
    const modal = await this.modalCtrl.create({
      component: ScheduleDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details, currentUser: this.user },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  ionViewWillEnter() {
    console.log('visited');
    const totalUnreadNotification = Number(this.storageService.getTotalUnreadNotif());
    if(totalUnreadNotification !== this.totalUnreadNotification) {
      this.hasChanges = true;
    }
    if(this.hasChanges) {
      this.initDashboard(this.user.clientId);
    }
  }

  async openNotif(notification: Notifications) {
    const navigationExtras: NavigationExtras = {
      state: {
        open: notification
      }
    };
    this.hasChanges = true;
    this.router.navigate(['notification'], navigationExtras);
  }

  async doRefresh(event: any){
    await this.initDashboard(this.user.clientId);
 }

  profilePicErrorHandler(event) {
    event.target.src = '../../../assets/img/profile-not-found.png';
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
