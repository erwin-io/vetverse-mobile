import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Client } from 'src/app/core/model/client.model';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PetService } from '../../core/services/pet.service';
import { Pet, PetCategory, PetType } from 'src/app/core/model/appointment.model';
import { FormControl } from '@angular/forms';
import { PetDetailsPage } from './pet-details/pet-details.page';
import { PetAddPage } from './pet-add/pet-add.page';
@Component({
  selector: 'app-pets',
  templateUrl: './pets.page.html',
  styleUrls: ['./pets.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PetsPage implements OnInit {
  currentUser: LoginResult;
  data: Pet[] = [];
  keywordCtrl = new FormControl('');
  isLoading = false;
  error: any;
  refreshEvent: any;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private alertController: AlertController,
    private petService: PetService,
    private storageService: StorageService,
    private actionSheetCtrl: ActionSheetController) {
    this.currentUser = this.storageService.getLoginUser();
    this.loadPet(this.currentUser.clientId);
  }

  ngOnInit() {
  }

  async loadPet(clientId: string){
    try {
      this.isLoading = true;
      this.petService.getByClientId(clientId).subscribe((res)=> {
        if(res.success){
          console.log(res.data);
          this.data = res.data;
          if(this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.refreshEvent = null;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message)
            ? res.message[0]
            : res.message;
          this.presentAlert(this.error);
        }
      },
      async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        this.presentAlert(this.error);
      });
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.presentAlert(this.error);
    }
  }

  ionViewWillEnter(){
    console.log('visited');
  }

  filter() {
    this.isLoading = true;
    const keyword = this.keywordCtrl.value.toLowerCase();
    this.data = this.data.length > 0 ?
    this.data.filter(x=>x.name.toLowerCase().includes(keyword) ||
    x.name.toLowerCase().includes(keyword) ||
    x.petCategory.name.toLowerCase().includes(keyword) ||
    x.petCategory.petType.name.toLowerCase().includes(keyword)) : [];
    this.isLoading = false;
  }

   async doRefresh(event){
    this.refreshEvent = event;
    await this.loadPet(this.currentUser.clientId);
  }

  async openAddModal() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: PetAddPage,
      cssClass: 'modal-fullscreen',
      componentProps: { modal, isNew: true, details: { clientId: this.currentUser.clientId } },
    });
    modal.present();
    await modal.onWillDismiss();

    this.loadPet(this.currentUser.clientId);
  }

  async edit(details: Pet) {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: PetAddPage,
      cssClass: 'modal-fullscreen',
      componentProps: { modal, details: {
        petId: details.petId,
        name: details.name,
        birthDate: details.birthDate,
        weight: details.weight,
        clientId: details.client.clientId,
        petTypeId: details.petCategory.petType.petTypeId,
        petCategoryId: details.petCategory.petCategoryId,
        genderId: details.gender.genderId,
      } },
    });
    modal.present();
    await modal.onWillDismiss();

    this.loadPet(this.currentUser.clientId);
  }

  async details(details) {
    const modal = await this.modalCtrl.create({
      component: PetDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details },
    });
    modal.present();

    await modal.onWillDismiss();
  }

  async more(details){
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Details',
          data: {isDetails: true},
        },
        {
          text: 'Edit',
          data: {isEdit: true},
        },
        {
          text: 'Delete',
          role: 'destructive',
          data: {isDelete: true},
          handler: async ()=> {
            await this.presentAlert({
              header: 'Delete pet?',
              buttons: [
                {
                  text: 'CANCEL',
                  role: 'cancel',
                },
                {
                  text: 'YES',
                  role: 'confirm',
                  handler: () => {
                    this.delete(details.petId);
                  },
                },
              ],
            });
          }
        },
        {
          text: 'Back',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    console.log(result);
    if(result.data && result.data.isDetails) {
      this.details(details);
    } else if(result.data && result.data.isEdit){
      this.edit(details);
    }
  }

  async delete(id) {
    try{
      this.isLoading = true;
      this.petService.delete(id)
        .subscribe(async res => {
          if (res.success) {
            this.loadPet(this.currentUser.clientId);
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

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
