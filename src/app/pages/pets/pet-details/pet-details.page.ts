import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Appointment, Pet, PetAppointment } from 'src/app/core/model/appointment.model';
import { PetService } from 'src/app/core/services/pet.service';
import { ScheduleDetailsPage } from '../../schedule/schedule-details/schedule-details.page';

@Component({
  selector: 'app-pet-details',
  templateUrl: './pet-details.page.html',
  styleUrls: ['./pet-details.page.scss'],
})
export class PetDetailsPage implements OnInit {

  details: Pet = new Pet();
  records: PetAppointment[] = [];
  petForm: FormGroup;
  isLoading = false;

  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private petService: PetService) { }

  ngOnInit() {
    this.loadRecords();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async loadRecords() {
    try{
      this.isLoading = true;
      this.petService.getPetMedicalRecords(this.details.petId)
        .subscribe(async res => {
          if (res.success) {
            this.details = res.data;
            this.records = res.data.petAppointments.filter(x=>x.appointment.appointmentStatus.appointmentStatusId === '3');
            console.log(this.records);
            this.isLoading = false;
          } else {
            this.isLoading = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          this.isLoading = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async recordDetails(appointment: any) {
    const modal = await this.modalCtrl.create({
      component: ScheduleDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details: appointment },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  confirm() {
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
