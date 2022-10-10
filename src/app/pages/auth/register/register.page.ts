import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { MyErrorStateMatcher } from '../../../core/form-validation/error-state.matcher';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  isSubmitting = false;
  registerForm: FormGroup;
  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName : [null, Validators.required],
      middleName : [null],
      lastName : [null, Validators.required],
      email : [null, Validators.required],
      mobileNumber : [null, Validators.required],
      address : [null, Validators.required],
      birthDate : [null, Validators.required],
      genderId : [null, Validators.required],
      username : [null, Validators.required],
      password : [null, Validators.required],
      confirmPassword : '',
    }, { validators: this.checkPasswords });
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  async onFormSubmit(form: NgForm) {
    console.log(form);
    if(!this.registerForm.valid){
      return;
    }
    try{
      this.isSubmitting = true;
      this.authService.register(form)
        .subscribe(async res => {
          if (res.success) {
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK']
            }).then(() =>{
              this.router.navigate(['login'], { replaceUrl: true });
              this.isSubmitting = false;
            });
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

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
