/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { Pet, PetCategory, PetType } from 'src/app/core/model/appointment.model';
import { FilterPetCategoryPipe } from 'src/app/core/pipe/filter-pet-category.pipe';
import { PetCategoryService } from 'src/app/core/services/pet-category.service';
import { PetTypeService } from 'src/app/core/services/pet-type.service';
import { PetService } from 'src/app/core/services/pet.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';

export class PetAddModel {
  petId?: string;
  name: string;
  birthDate: Date;
  weight: number;
  clientId?: string;
  petCategoryId: string;
  petTypeId: string;
  genderId: string;
}

@Component({
  selector: 'app-pet-add',
  templateUrl: './pet-add.page.html',
  styleUrls: ['./pet-add.page.scss']
})
export class PetAddPage implements OnInit {
  isNew = false;
  modal: HTMLIonModalElement;
  petForm: FormGroup;
  details: PetAddModel = new PetAddModel();
  defaultDate = '1987-06-30';
  isSubmitted = false;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  isLoading = false;


  private _petTypeData: PetType[] = [];
  private _petCategoryData: PetCategory[] = [];

  constructor(
    private petService: PetService,
    private petTypeService: PetTypeService,
    private petCategoryService: PetCategoryService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService) {
      this.initLookup();
  }

  get formData(){
    return {
      petId: this.details.petId,
      clientId: this.details.clientId,
      ...this.petForm.value,
    };
  }

  get errorControls() {
    return this.petForm.controls;
  }

  get petTypeOption() {
    return this._petTypeData;
  }

  get petCatgoryOption() {
    return this._petCategoryData.filter(x=>x.petType.petTypeId === this.formData.petTypeId);
  }

  initLookup(){
    this.isLoading = true;
    forkJoin(
      this.petTypeService.get(),
      this.petCategoryService.get(),
  ).subscribe(
      ([getPetTypeService, getPetCategoryService]) => {
          // do things
          this._petTypeData = getPetTypeService.data;
          this._petCategoryData = getPetCategoryService.data;
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
      }
  );
  }

  ngOnInit() {
    console.log(this.details);
    this.petForm = this.formBuilder.group({
      petTypeId: [this.details.petTypeId, Validators.required],
      petCategoryId: [this.details.petCategoryId, Validators.required],
      name: [this.details.name, [Validators.required, Validators.minLength(2)]],
      genderId: [this.details.genderId, Validators.required],
      birthDate: [this.details.birthDate, Validators.required],
      weight: [this.details.weight, Validators.required],
    });
  }

  async onSubmit() {
    const params = this.formData;
    console.log(params);
    if(!this.petForm.valid){
      return;
    }
    await this.presentAlert({
      header: 'Save pet?',
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
        },
        {
          text: 'YES',
          role: 'confirm',
          handler: () => {
            if(this.isNew){
              this.save(params);
            } else {
              this.update(params);
            }
          },
        },
      ],
    });
  }

  async save(params){
    try{
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.petService.add(params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK']
            });
            this.isSubmitting = false;
            this.modal.dismiss({success: true, data: res.data}, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }
  async update(params){
    try{
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.petService.udpdate(params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK']
            });
            this.isSubmitting = false;
            this.modal.dismiss({success: true, data: res.data}, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }

}
