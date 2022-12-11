import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Appointment } from 'src/app/core/model/appointment.model';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { VideoConferencePage } from './video-conference/video-conference.page';
import { WebrtcService } from 'src/app/core/services/webrtc.service';
import { InAppBrowserObject, InAppBrowser } from '@ionic-native/in-app-browser';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';

@Component({
  selector: 'app-schedule-details',
  templateUrl: './schedule-details.page.html',
  styleUrls: ['./schedule-details.page.scss'],
})
export class ScheduleDetailsPage implements OnInit {
  hasChanges = false;
  currentUser: LoginResult;
  isLoading = false;
  details: Appointment = {} as any;
  conferenceWebURL;
  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService,
    private userService: UserService,
    private appconfig: AppConfigService,
    private appointmentService: AppointmentService) {
  }

  get appointmentDate(){
    return moment(this.details.appointmentDate).format('dddd, MMM DD, YYYY');
  }
  get time() {
    const timeStart = moment(`${this.details.appointmentDate} ${this.details.timeStart}`).format('h:mm a');
    const timeEnd = moment(`${this.details.appointmentDate} ${this.details.timeEnd}`).format('h:mm a');
    return `${timeStart} - ${timeEnd}`;
  }

  get isVideoConferenceAvailable() {
    if(this.isLoading) {
      return false;
    } else {
      const today: any = new Date();
      const appointmentDateStr = moment(`${this.details.appointmentDate} ${this.details.timeStart}`).format('YYYY-MM-DD h:mm a');
      const date: any = new Date(appointmentDateStr);
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? true : Math.abs(diffTime) <= 600000;
    }
  }

  get isCancellationAvailable() {
    if(this.isLoading) {
      return false;
    } else {
      const today: any = new Date();
      const date: any = new Date(this.currentUser.lastCancelledDate);
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Number(this.currentUser.numberOfCancelledAttempt) >= Number(this.appconfig.config.appointmentConfig.maxCancellation) ?
      diffDays > Number(this.appconfig.config.appointmentConfig.daysCancellationLimitReset) : true;
    }
  }


  ngOnInit() {
    console.log(this.details);
    console.log(this.currentUser);
    this.getAppointment(this.details.appointmentId);

  }

  async getAppointment(appointmentId: string) {
    try{
      this.isLoading = true;
      this.appointmentService.getById(appointmentId)
      .subscribe(async res => {
        console.log(res);
        if(res.success){
          this.details = res.data;
          this.isLoading = false;
          this.conferenceWebURL = `${environment.conferenceHost}video-conference/accept/${res.data.appointmentId}`;
        }
        else{
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
        }
      }, async (e) => {
        await this.presentAlert({
          header: 'Try again!',
          subHeader: '',
          message: Array.isArray(e.message) ? e.message[0] : e.message,
          buttons: ['OK']
        });
        this.isLoading = false;
      });
    }
    catch(e){
      console.log(e);
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onCancelAppointment() {
    await this.presentAlert({
      header: 'Are you sure you want to cancel?',
      buttons: [
        {
          text: 'BACK',
          role: 'cancel',
        },
        {
          text: 'YES',
          role: 'confirm',
          handler: async () => {
            this.cancelAppointment();
          },
        },
      ],
    });
  }

  async cancelAppointment(){
    try{
      await this.pageLoaderService.open('Processing please wait...');
      this.isLoading = true;
      this.appointmentService.updateAppointmentStatus({
        appointmentId: this.details.appointmentId,
        appointmentStatusId: '4',
        isUpdatedByClient: true
      })
        .subscribe(async res => {
          if (res.success) {
            this.hasChanges = true;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Appointment cancelled!',
              buttons: ['OK']
            });
            this.isLoading = false;
            this.getClientCancellationAttempt();
          } else {
            await this.pageLoaderService.close();
            this.isLoading = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          this.isLoading = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async getClientCancellationAttempt() {
    try{
      this.isLoading = true;
      this.userService.getById(this.currentUser.userId)
      .subscribe(async res => {
        if(res.success){
          this.currentUser.numberOfCancelledAttempt = res.data.numberOfCancelledAttempt;
          this.currentUser.lastCancelledDate = res.data.lastCancelledDate;
          this.storageService.saveLoginUser(this.currentUser);
          if(Number(this.currentUser.numberOfCancelledAttempt) >= Number(this.appconfig.config.appointmentConfig.maxCancellation)) {
            await this.presentAlert({
              header: 'Warning!',
              message: `You have reached the maximum number of cancellation of appointments allowed.
              This account is restricted for booking an appointment
              for ${this.appconfig.config.appointmentConfig.daysCancellationLimitReset} day(s).
              Due to violation of cancellation of appointments within the given limit.`,
              buttons: ['OK']
            });
          }
          this.isLoading = false;
          this.getAppointment(this.details.appointmentId);
        }
        else{
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
        }
      }, async (e) => {
        await this.presentAlert({
          header: 'Try again!',
          subHeader: '',
          message: Array.isArray(e.message) ? e.message[0] : e.message,
          buttons: ['OK']
        });
        this.isLoading = false;
      });
    }
    catch(e){
      console.log(e);
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }


  async joinVideoConference() {
    await Browser.open({ url: this.conferenceWebURL });

  }

  cancel() {
    return this.modalCtrl.dismiss(this.hasChanges ? this.hasChanges : null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

}
