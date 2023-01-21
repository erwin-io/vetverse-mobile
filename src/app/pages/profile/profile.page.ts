/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
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
import { Plugins } from '@capacitor/core';
import { ReminderPage } from './reminder/reminder.page';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ClientReminders } from 'src/app/core/model/client-reminder.model';
import { ClientReminderService } from 'src/app/core/services/client-reminder.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isLoading;
  upcomingAppointment: Appointment = new Appointment();
  totalUnreadNotification = 0;
  totalUpcoming = 0;
  hasChanges = false;
  clientReminders: ClientReminders[] = [];
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private clientReminderService: ClientReminderService,
    private alertController: AlertController,
    private calendar: Calendar,
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
      this.notificationService.getTotalUnreadByClientId({clientId}),
      this.clientReminderService.getAll(),
  ).subscribe(
      ([getUpcomingAppointment, getTotalUnread, getAllReminders]) => {
          // do things
          this.upcomingAppointment = getUpcomingAppointment.data.appointment;
          this.totalUpcoming = getUpcomingAppointment.data.total;
          this.totalUnreadNotification = getTotalUnread.data.total;
          this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);

          this.clientReminders = getAllReminders;
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
        this.hasChanges = false;
      }
  );
  }

  async ngOnInit() {
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

  async ionViewWillEnter() {
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

  async onAddReminder() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: ReminderPage,
      cssClass: 'modal-fullscreen',
      componentProps: { modal, isNew: true },
    });
    modal.onWillDismiss().then(async (res) => {
      this.clientReminders = await this.clientReminderService.getAll();
    });
    modal.present();

    //this.loadPet(this.currentUser.clientId);
  }

  async onEditReminder(reminder) {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: ReminderPage,
      cssClass: 'modal-fullscreen',
      componentProps: { modal, isNew: false, details: reminder },
    });
    modal.onWillDismiss().then(async (res) => {
      this.clientReminders = await this.clientReminderService.getAll();
    });
    modal.present();

    //this.loadPet(this.currentUser.clientId);
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
