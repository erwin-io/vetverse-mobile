import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Appointment } from 'src/app/core/model/appointment.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ScheduleDetailsPage } from '../schedule-details/schedule-details.page';

@Component({
  selector: 'app-schedule-pending',
  templateUrl: './schedule-pending.page.html',
  styleUrls: ['./schedule-pending.page.scss']
})
export class SchedulePendingPage implements OnInit {
  currentClientId: string;
  isLoading = false;
  appointment: Appointment[] = [];
  message = '';
  refreshEvent: any;
  constructor(private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.getAppointment(this.currentClientId);
  }

  async getAppointment(clientId: string) {
    try{
      this.isLoading = true;
      this.appointmentService.getClientAppointmentsByStatus({
        clientId,
        appointmentStatus: 'Pending'
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

  async doRefresh(event){
    this.refreshEvent = event;
    await this.getAppointment(this.currentClientId);
  }

  async showMenu(details){
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [{
          text: 'Details',
          handler:async () => {
            this.onOpenDetails(details);
            actionSheet.dismiss();
          }
        },
        {
          text: 'Cancel',
          handler:async () => {
            actionSheet.dismiss();
          }
        }
      ]
    });
    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    console.log(result);
  }

  async onOpenDetails(details) {
    const modal = await this.modalCtrl.create({
      component: ScheduleDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }


  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
