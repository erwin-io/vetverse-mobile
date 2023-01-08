import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FcmService } from 'src/app/core/services/fcm.service';
import { PetService } from 'src/app/core/services/pet.service';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { LoaderService } from 'src/app/core/ui-service/loader.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html',
  styleUrls: ['./verify-otp.page.scss'],
})
export class VerifyOtpPage implements OnInit {
  isSubmitting = false;
  verifyOtpForm: FormGroup;
  sessionTimeout;
  userId: string;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private petService: PetService,
    private fcmService: FcmService,
    private appconfig: AppConfigService,
    private pageLoaderService: PageLoaderService,
    ) {
      this.sessionTimeout = Number(
        this.appconfig.config.sessionConfig.sessionTimeout
      );
    }

  get formData() {
    return {
      ...this.verifyOtpForm.value,
      userId: this.userId,
    };
  }

  ngOnInit() {
    if(window.history.state && window.history.state.data && window.history.state.data.userId){
      this.userId = window.history.state.data.userId;
      console.log(window.history.state.data);
    }else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    this.verifyOtpForm = this.formBuilder.group({
      otp : [null, Validators.required]
    });
  }

  async onFormSubmit() {
    if(!this.verifyOtpForm.valid){
      return;
    }
    const params = this.formData;
    console.log(params);
    try{
      this.isSubmitting = true;
      await this.pageLoaderService.open('Verifying please wait...');
      this.authService.verifyOtp(params)
        .subscribe(async res => {
          await this.pageLoaderService.close();
          if (res.success) {
            this.storageService.saveRefreshToken(res.data.accessToken);
            this.storageService.saveAccessToken(res.data.refreshToken);
            this.storageService.saveTotalUnreadNotif(res.data.totalUnreadNotif);
            const today = new Date();
            today.setTime(today.getTime() + this.sessionTimeout * 1000);
            this.storageService.saveSessionExpiredDate(today);
            const userData: LoginResult = res.data;
            this.storageService.saveLoginUser(userData);
            this.fcmService.init();
            this.router.navigate(['/'], { replaceUrl: true });
            this.isSubmitting = false;
          } else {
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          console.log(err);
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
      console.log(e);
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
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
