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

@Component({
  selector: 'app-schedule-details',
  templateUrl: './schedule-details.page.html',
  styleUrls: ['./schedule-details.page.scss'],
})
export class ScheduleDetailsPage implements OnInit {
  isLoading = false;
  details: Appointment = {} as any;
  conferenceWebURL;
  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private webrtcService: WebrtcService,
    private pageLoaderService: PageLoaderService,
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
    return true;
  }


  ngOnInit() {
    console.log(this.details);
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
        appointmentStatusId: '4'
      })
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Appointment cancelled!',
              buttons: ['OK']
            });
            this.isLoading = false;
            this.getAppointment(this.details.appointmentId);
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


  async joinVideoConference() {
    // console.log(this.details);
    // const modal = await this.modalCtrl.create({
    //   component: VideoConferencePage,
    //   cssClass: 'modal-fullscreen',
    //   componentProps: {
    //     appointmentId: this.details.appointmentId,
    //     myWebRTCUserId: `${this.details.clientAppointment.client.user.userId}_${this.details.clientAppointment.client.user.username}`,
    //     partnerWebRTCUserId: `${this.details.staff.user.userId}_${this.details.staff.user.username}`,
    //    },
    // });
    // modal.present();

    // const { data, role } = await modal.onWillDismiss();


    // window.open(this.conferenceWebURL);

    await Browser.open({ url: this.conferenceWebURL });

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
