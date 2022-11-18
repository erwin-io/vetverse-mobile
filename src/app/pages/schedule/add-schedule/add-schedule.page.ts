/* eslint-disable no-underscore-dangle */
import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, AfterViewChecked, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AlertController, IonModal, ModalController, Platform } from '@ionic/angular';
import { IonSlides} from '@ionic/angular';
import { forkJoin, Subscription } from 'rxjs';
import { Appointment, ConsultaionType, PaymentType, Pet, ServiceType } from 'src/app/core/model/appointment.model';
import { Staff } from 'src/app/core/model/staff.model';
import { PetService } from 'src/app/core/services/pet.service';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { InAppBrowserObject, InAppBrowser } from '@ionic-native/in-app-browser';
import { LoginResult } from 'src/app/core/model/loginresult.model';


@Component({
  selector: 'app-add-schedule',
  templateUrl: './add-schedule.page.html',
  styleUrls: ['./add-schedule.page.scss'],
})
export class AddSchedulePage implements OnInit {
  @ViewChild('appointmentStepper') appointmentStepper: MatStepper;
  isNew = false;
  modal: HTMLIonModalElement;
  currentUser: LoginResult;
  name: string;
  details: Appointment = {} as any;
  pets: Pet[] = [];
  appointmentForm: FormGroup;
  paymentForm: FormGroup;
  isSubmitting = false;
  isLoading = false;
  consultaionTypeOption: ConsultaionType[] = [];
  paymentTypeOption: PaymentType[] = [];
  serviceTypeOption: ServiceType[] = [];
  petOption: Pet[] = [];
  vetOption: Staff[] = [];
  petModalSelected: Pet;
  error: any;
  petRefreshEvent: any;
  subscription: Subscription;
  allowToClose = false;

  currentDate = new Date();
  minDate: string = new Date(new Date().setDate(this.currentDate.getDate() + 1)).toISOString();
  constructor(private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private appointmentService: AppointmentService,
    private pageLoaderService: PageLoaderService,
    private appconfig: AppConfigService,
    private platform: Platform,
    public sanitizer: DomSanitizer) {
      this.consultaionTypeOption = this.appconfig.config.lookup.consultaionType;
      this.paymentTypeOption = this.appconfig.config.lookup.paymentTypes;
  }

  get formData(){
    return {
      ...this.appointmentForm.value,
      ...this.paymentForm.value,
      serviceTypeId: this.appointmentForm.valid ? this.appointmentForm.value.serviceType.serviceTypeId : null,
      appointmentDate: moment(this.appointmentForm.value.appointmentDate).format('YYYY-MM-DD'),
      time: moment(this.appointmentForm.value.time).format('HH:mm'),
      clientId: this.currentUser.clientId,
    };
  }

  get errorControls() {
    return {
      ...this.appointmentForm.controls,
      ...this.paymentForm.controls,
    };
  }

  ngOnInit() {
    console.log(this.minDate);
    this.appointmentForm = this.formBuilder.group({
      consultaionTypeId: ['', Validators.required],
      serviceType: ['', Validators.required],
      appointmentDate: [this.minDate, Validators.required],
      time: [this.currentDate.toISOString(), Validators.required],
      petId: ['', Validators.required],
      veterenarianId: ['', Validators.required],
      comments: ['', Validators.required],
    });
    this.paymentForm = this.formBuilder.group({
      paymentTypeId: ['', Validators.required],
      paymentDate: [new Date(), Validators.required],
    });
    console.log(this.formData);

    this.allowToClose = true;

    this.subscription = this.platform.backButton.subscribeWithPriority(9999, (e) => {
      if(this.modal.canDismiss){
        this.cancel();
      }
      this.pageLoaderService.close();
    });
  }


  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  onSelectFocus(control: any, value: any) {
    console.log('click');
    setTimeout(()=>{
      control.setValue(value);
    }, 1000);
  }

  cancel() {
    if(this.appointmentStepper.selectedIndex !== 0) {
      this.appointmentStepper.selectedIndex  = this.appointmentStepper.selectedIndex - 1;
    }else {
      this.modal.canDismiss = true;
      this.modalCtrl.dismiss(null, 'cancel');
    }
  }


  async payNow() {
    if(!this.paymentForm.valid){
      return;
    }
    const isCash = Number(this.formData.paymentTypeId??0) === 1;
    this.modal.canDismiss = false;
    if(isCash) {
      await this.presentAlert({
        header: 'Book now?',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: () => {
              const params = this.formData;
              this.save(params);
            },
          },
        ],
      });
    } else {
      await this.presentAlert({
        header: 'Confirm payment?',
        buttons: [
          {
            text: 'CANCEL',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: async () => {
              await this.pageLoaderService.open('Requesting payment...');
              this.showPaymentRequest();
            },
          },
        ],
      });
    }
  }

  async save(params){
    try{
      await this.pageLoaderService.open('Booking appointment...');
      this.isSubmitting = true;
      this.appointmentService.createClientAppointment(params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Booked!',
              buttons: ['OK']
            });
            this.isSubmitting = false;
            this.modal.canDismiss = true;
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

  async showPaymentRequest(){
    const service = this.serviceTypeOption.filter(x=>x.serviceTypeId === this.formData.serviceType.serviceTypeId)[0];
    const url = 'https://getpaid.gcash.com/paynow?'
    + 'public_key=' + 'pk_c53cadc7fec19fc887c63717c22955fa'
    + '&amount=' + service.price
    + '&fee=0'
    + '&expiry=6'
    + '&description=' + service.name;
    let browserURL = '';
    const browser: InAppBrowserObject = InAppBrowser.create(url,'_blank',{location:'no',clearcache:'yes',toolbar:'no'});
    browser.show();
    browser.on('loadstart').subscribe((e) => {
      browserURL = e.url;
      if(!browserURL.toLowerCase().includes('getpaid.gcash.com/checkout') &&
      browserURL.toLowerCase().includes('payments.gcash.com/gcash-cashier-web') &&
      (browserURL.toLowerCase().includes('login') || browserURL.toLowerCase().includes('confirm'))){
        this.pageLoaderService.close();
        this.showLoginToPay(browserURL);
      }
    });
    browser.on('exit').subscribe((e) => {
      this.pageLoaderService.close();
      browserURL = e.url;
      if(!browserURL.toLowerCase().includes('getpaid.gcash.com/checkout') &&
      browserURL.toLowerCase().includes('payments.gcash.com/gcash-cashier-web') &&
      (browserURL.toLowerCase().includes('login') || browserURL.toLowerCase().includes('confirm'))){
        this.showLoginToPay(browserURL);
      } else {
        this.modal.canDismiss = true;
      }
      this.pageLoaderService.close();
    });
  }

  async showLoginToPay(url){
    this.modal.canDismiss = false;
    let browserURL = '';
    let success = false;
    const browser: any = InAppBrowser.create(url,'_blank',{location:'no',clearcache:'yes',toolbar:'no'});
    browser.show();
    browser.on('loadstart').subscribe((e) => {
      browserURL = e.url;
      success = success ? true : (browserURL.toLowerCase().includes('success')
      || browserURL.toLowerCase().includes('paymentsuccess'));
      if(success) {
        browser.close();
        this.pageLoaderService.close();
        this.presentAlert({
          header: 'Payment Successful!',
          message: 'Click continue to save booking!',
          buttons: [
            {
              text: 'CONTINUE',
              role: 'confirm',
              handler: () => {
                const params = this.formData;
                this.saveCashless(params);
              },
            }],
        });
      }
    });
    browser.on('loadstop').subscribe((e) => {
      browserURL = e.url;
      success = success ? true : (browserURL.toLowerCase().includes('success')
      || browserURL.toLowerCase().includes('paymentsuccess'));
      if(success) {
        browser.close();
        this.pageLoaderService.close();
        this.presentAlert({
          header: 'Payment Successful!',
          message: 'Click continue to save booking!',
          buttons: [
            {
              text: 'CONTINUE',
              role: 'confirm',
              handler: () => {
                const params = this.formData;
                this.saveCashless(params);
              },
            }],
        });
      }
    });
  }

  async saveCashless(params){
    this.modal.canDismiss = false;
    try{
      await this.pageLoaderService.open('Booking appointment...');
      this.isSubmitting = true;
      this.appointmentService.createClientCashlessAppointment(params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Booked!',
              buttons: ['OK']
            });
            this.isSubmitting = false;
            this.modal.canDismiss = true;
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


  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
