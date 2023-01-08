/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonModal, ModalController, Platform } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { Pet, PetCategory, PetType } from 'src/app/core/model/appointment.model';
import { FilterPetCategoryPipe } from 'src/app/core/pipe/filter-pet-category.pipe';
import { PetCategoryService } from 'src/app/core/services/pet-category.service';
import { PetTypeService } from 'src/app/core/services/pet-type.service';
import { PetService } from 'src/app/core/services/pet.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import * as moment from 'moment';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';

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
  petProfilePic;

  private _petTypeData: PetType[] = [];
  private _petCategoryData: PetCategory[] = [];

  constructor(
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private modalCtrl: ModalController,
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
      birthDate: moment(this.petForm.value.birthDate).format('YYYY-MM-DD'),
      petProfilePic: this.petProfilePic,
    };
  }

  get isFormDirty() {
    return this.details.petTypeId !== this.formData.petTypeId ||
    this.details.petCategoryId !== this.formData.petCategoryId ||
    this.details.name !== this.formData.name ||
    this.details.genderId !== this.formData.genderId ||
    this.details.weight !== this.formData.weight ||
    moment(this.details.birthDate).format('YYYY-MM-DD').toString() !== moment(this.formData.birthDate).format('YYYY-MM-DD') ||
    this.petProfilePic.isNew;
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
        if(!this.isNew) {
          this.petForm.controls.petTypeId.setValue(this.details.petTypeId);
          this.petForm.controls.petCategoryId.setValue(this.details.petCategoryId);
          this.petForm.controls.name.setValue(this.details.name);
          this.petForm.controls.genderId.setValue(this.details.genderId);
          this.petForm.controls.birthDate.setValue(this.details.birthDate.toISOString());
          this.petForm.controls.weight.setValue(this.details.weight);
        }
        this.isLoading = false;
      }
  );
  }

  ngOnInit() {
    this.petForm = this.formBuilder.group({
      petTypeId: [null, Validators.required],
      petCategoryId: [null, Validators.required],
      name: [null, [Validators.required, Validators.minLength(2)]],
      genderId: [null, Validators.required],
      birthDate: [new Date().toISOString(), Validators.required],
      weight: [0, Validators.required],
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
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
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
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onChangeProfilePic() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [
        {
          text: 'Camera',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri,
              source: CameraSource.Camera, // Camera, Photos or Prompt!
            });
            if (image) {
              const base64Data = await this.readAsBase64(image);
              this.petProfilePic = {
                fileName: `profile-sample-name.${image.format}`,
                data: base64Data,
                source: `data:image/${image.format};base64,${base64Data}`,
                isNew: true
              };
            }
            actionSheet.dismiss();
          },
        },
        {
          text: 'Gallery',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri,
              source: CameraSource.Photos, // Camera, Photos or Prompt!
            });
            if (image) {
              const base64Data = await this.readAsBase64(image);
              this.petProfilePic = {
                fileName: `profile-sample-name.${image.format}`,
                data: base64Data,
                source: `data:image/${image.format};base64,${base64Data}`,
                isNew: true
              };
            }
            actionSheet.dismiss();
          },
        },
        {
          text: 'Cancel',
          handler: async () => {
            actionSheet.dismiss();
          },
        },
      ],
    });
    await actionSheet.present();

    // const result = await actionSheet.onDidDismiss();
    // console.log(result);
  }
  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      const base64 = (await this.convertBlobToBase64(blob)) as string;
      console.log(base64);
      return base64.split(',')[1];
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  async profilePicErrorHandler(event) {
    event.target.src = '../../../assets/img/pet-profile-not-found.png';
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }

}
