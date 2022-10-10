import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { AddSchedulePage } from './add-schedule/add-schedule.page';
import {map} from 'rxjs/operators';
import { LoaderService } from 'src/app/core/ui-service/loader.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Appointment } from 'src/app/core/model/appointment.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  currentUserId: string;
  type;
  isLoading = false;
  appointment: Appointment[] = [];
  message = 'This modal example uses the modalController to present and dismiss modals.';
  constructor(private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private appointmentService: AppointmentService) {
      this.currentUserId = this.storageService.getLoginUser().userId;
    }

  ngOnInit() {
    this.type = 'upcoming';
    this.getAppointment();
  }

  async getAppointment() {
    try{
      this.isLoading = true;
      this.appointmentService.get()
      .subscribe(async res => {
        console.log(res);
        if(res.success){
          // const data = res.data.filter(x=>!x.isWalkIn && x.clientAppointment.client.user.userId === this.currentUserId).map((a)=>({
          //     appointmentId: a.appointmentId,
          //     appointmentDate: a.appointmentDate,
          //     timeStart: a.timeStart,
          //     timeEnd: a.timeEnd,
          //     isWalkIn: a.isWalkIn,
          //     client: a.isWalkIn ? a.walkInAppointmentNotes : a.clientAppointment.client.fullName,
          //     vet: a.staff.fullName,
          //     vetUserId: a.staff.staffid,
          //     consultaionType: a.consultaionType.name,
          //     service: a.serviceType.name,
          //     amountToPay: a.serviceType.price,
          //     isPaid: a.isPaid,
          //     appointmentStatus: a.appointmentStatus.name
          //   }));
          this.appointment = res.data.filter(x=>!x.isWalkIn && x.clientAppointment.client.user.userId === this.currentUserId);
          this.isLoading = false;
          console.log(this.appointment);
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

  async showMenu(){
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [{
        text: 'Open',
        role: 'destructive',
        id: 'open-button',
        data: {
          type: 'open'
        },
        handler: () => {
          console.log('Open clicked');
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        id: 'delete-button',
        data: {
          type: 'delete'
        },
        handler: () => {
          console.log('Delete clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }
  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddSchedulePage,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
