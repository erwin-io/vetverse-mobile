import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { Client } from 'src/app/core/model/client.model';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { PetCategoryService } from 'src/app/core/services/pet-category.service';
import { PetTypeService } from 'src/app/core/services/pet-type.service';
import { PetService } from 'src/app/core/services/pet.service';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {
  modal;
  user: LoginResult;
  editProfileForm: FormGroup;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService) {
    this.user = this.storageService.getLoginUser();
  }

  get formData() {
    return {
      ...this.editProfileForm.value,
      userId: this.user.userId
    };
  }

  get isFormDirty() {
    return (
      this.user.firstName !== this.formData.firstName ||
      this.user.middleName !== this.formData.middleName ||
      this.user.lastName !== this.formData.lastName ||
      this.user.email !== this.formData.email ||
      this.user.mobileNumber !== this.formData.mobileNumber ||
      this.user.address !== this.formData.address ||
      moment(this.user.birthDate).format('YYYY-MM-DD') !== moment(this.formData.birthDate).format('YYYY-MM-DD') ||
      this.user.gender.genderId !== this.formData.genderId
    );
  }

  get errorControls() {
    return this.editProfileForm.controls;
  }

  ngOnInit() {
    console.log(this.user);
    this.editProfileForm = this.formBuilder.group({
      firstName : [this.user.firstName, Validators.required],
      middleName : [this.user.middleName],
      lastName : [this.user.lastName, Validators.required],
      email : [this.user.email, Validators.required],
      mobileNumber : [this.user.mobileNumber, Validators.required],
      address : [this.user.address, Validators.required],
      birthDate : [new Date(this.user.birthDate).toISOString(), Validators.required],
      genderId : [this.user.gender.genderId, Validators.required]
    });
    console.log(this.formData);
  }

  async onSubmit() {
    const params = this.formData;
    console.log(params);
    if (!this.editProfileForm.valid) {
      return;
    }
    try {
      await this.presentAlert({
        header: 'Continue?',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: () => {
              this.save(params);
            },
          },
        ],
      });
    }
    catch(ex) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons: ['OK'],
      });
    }
  }

  async save(params) {
    try {
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.userService.udpdateClient(params).subscribe(
        async (res) => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK'],
            });
            this.isSubmitting = false;
            this.user.firstName = res.data.firstName;
            this.user.middleName = res.data.middleName;
            this.user.lastName = res.data.lastName;
            this.user.fullName = res.data.fullName;
            this.user.email = res.data.email;
            this.user.mobileNumber = res.data.mobileNumber;
            this.user.address = res.data.address;
            this.user.birthDate = new Date(res.data.birthDate);
            this.user.gender = res.data.gender;
            this.storageService.saveLoginUser(this.user);
            this.modal.dismiss(res.data, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message)
                ? res.message[0]
                : res.message,
              buttons: ['OK'],
            });
          }
        },
        async (err) => {
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK'],
          });
        }
      );
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK'],
      });
    }
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
