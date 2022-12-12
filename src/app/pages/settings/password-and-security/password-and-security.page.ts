import { Component, OnInit } from '@angular/core';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from 'src/app/core/storage/storage.service';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/core/services/user.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { MyErrorStateMatcher } from 'src/app/core/form-validation/error-state.matcher';

@Component({
  selector: 'app-password-and-security',
  templateUrl: './password-and-security.page.html',
  styleUrls: ['./password-and-security.page.scss'],
})
export class PasswordAndSecurityPage implements OnInit {
  modal;
  user: LoginResult;
  changePasswordForm: FormGroup;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  matcher = new MyErrorStateMatcher();
  error;
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
      ...this.changePasswordForm.value,
      userId: this.user.userId
    };
  }

  get errorControls() {
    return this.changePasswordForm.controls;
  }

  get notSameValueErrorHandler() {
    return this.changePasswordForm.errors;
  }

  ngOnInit() {
    console.log(this.user);
    this.changePasswordForm = this.formBuilder.group({
      currentPassword : [null, Validators.required],
      newPassword : [null, Validators.required],
      confirmPassword : '',
    }, { validators: this.checkPasswords });
    console.log(this.formData);
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('newPassword').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };


  async onSubmit() {
    const params = this.formData;
    console.log(params);
    if (!this.changePasswordForm.valid) {
      return;
    }
    try {
      await this.presentAlert({
        header: 'Continue?',
        message: 'Are you sure you want to change your password',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES Continue',
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
      this.userService.changePassword(params).subscribe(
        async (res) => {
          console.log(res);
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Password changed!',
              buttons: ['OK'],
            });
            this.isSubmitting = false;
            this.modal.dismiss(res.data, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            this.error = Array.isArray(res.message)
              ? res.message[0]
              : res.message;
            await this.presentAlert({
              header: 'Try again!',
              message: this.error,
              buttons: ['OK'],
            });
            if(this.error.toLowerCase().includes('password not match')) {
              this.changePasswordForm.controls.currentPassword.setErrors( { incorrectPassword: true });
            }
          }
        },
        async (err) => {
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          this.error = Array.isArray(err.message)
            ? err.message[0]
            : err.message;
          await this.presentAlert({
            header: 'Try again!',
            message: this.error,
            buttons: ['OK'],
          });
        }
      );
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      this.error = Array.isArray(e.message)
        ? e.message[0]
        : e.message;
      await this.presentAlert({
        header: 'Try again!',
        message: this.error,
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
