import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { Appointment } from 'src/app/core/model/appointment.model';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ScheduleDetailsPage } from '../schedule-details/schedule-details.page';

@Component({
  selector: 'app-schedule-history',
  templateUrl: './schedule-history.page.html',
  styleUrls: ['./schedule-history.page.scss'],
})
export class ScheduleHistoryPage implements OnInit {
  currentUser: LoginResult;
  isLoading = false;
  appointment: Appointment[] = [];
  message = '';
  refreshEvent: any;
  currentPage = 1;
  limit = 10;
  totalUnreadNotification = 0;
  constructor(private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.initHistory(this.currentUser.clientId);
  }

  async initHistory(clientId: string) {
    try{
      this.isLoading = true;
      this.appointmentService.getClientAppointmentsByStatus({
        clientId,
        appointmentStatus: 'Completed,Cancelled'
      })
      .subscribe(async res => {
        console.log(res);
        if(res.success){
          this.appointment = res.data;
          if(this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.refreshEvent = null;
          }
          this.isLoading = false;
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

  async onOpenDetails(details) {
    const modal = await this.modalCtrl.create({
      component: ScheduleDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details, currentUser: this.currentUser },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  async loadMore() {
    this.currentPage = this.currentPage + 1;
    this.initHistory(this.currentUser.clientId);
  }

  async doRefresh(event: any){
    this.appointment = [];
    this.currentPage = 1;
    this.refreshEvent = event;
    this.initHistory(this.currentUser.clientId);
 }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }


  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
