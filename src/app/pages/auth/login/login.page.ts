
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../../../core/storage/storage.service';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { LoaderService } from 'src/app/core/ui-service/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { PetService } from 'src/app/core/services/pet.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isSubmitting = false;
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private petService: PetService,
    private pageLoaderService: PageLoaderService,
    ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username : [null, Validators.required],
      password : [null, Validators.required],
      rememberMe : [false]
    });
  }

  async onFormSubmit(form: NgForm) {
    const date = new Date();
    if(!this.loginForm.valid){
      return;
    }
    try{
      this.isSubmitting = true;
      // await this.loaderService.presentLoader('Loging in...');
      await this.pageLoaderService.open('Loging in please wait...');
      this.authService.login(form)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            this.storageService.saveRefreshToken(res.data.accessToken);
            this.storageService.saveAccessToken(res.data.refreshToken);
            this.storageService.saveTotalUnreadNotif(res.data.totalUnreadNotif);
            const userData: LoginResult = res.data;
            this.storageService.saveLoginUser(userData);
            this.router.navigate(['/'], { replaceUrl: true });
            this.isSubmitting = false;
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Try again!',
              subHeader: '',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          console.log(err);
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      console.log(e);
      this.isSubmitting = false;
      await this.pageLoaderService.close();
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
