/* eslint-disable no-underscore-dangle */
import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, AfterViewChecked, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AlertController, IonDatetime, IonModal, ModalController, Platform } from '@ionic/angular';
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
  @ViewChild(IonModal) timeSlotModal: IonModal;
  @ViewChild('selectTimeSlotDateCtrl', { static: true }) selectTimeSlotDateCtrl: ElementRef<IonDatetime>;
  isNew = false;
  modal: HTMLIonModalElement;
  currentUser: LoginResult;
  name: string;
  details: Appointment = {} as any;
  pets: Pet[] = [];
  selectTimeSlotForm: FormGroup;
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
  isTimeSlotModalOpen = false;
  availableTimeSlot = [];

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
      appointmentDate: this.appointmentForm.value.appointmentDate ?
        moment(this.appointmentForm.value.appointmentDate).format('YYYY-MM-DD') : null,
      time: this.appointmentForm.value.appointmentDate ?
        moment(this.appointmentForm.value.time).format('HH:mm') : null,
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
    this.selectTimeSlotForm = this.formBuilder.group({
      selectTimeSlotDate: [this.minDate, Validators.required],
      selectTime: [null, Validators.required],
    });
    this.appointmentForm = this.formBuilder.group({
      appointmentDate: [null, Validators.required],
      time: [null, Validators.required],
      consultaionTypeId: ['', Validators.required],
      serviceType: ['', Validators.required],
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
    const publicKey = `public_key=${this.appconfig.config.gCashConfig.publicKey}`;
    const gCashAmount = `&amount=${service.price}`;
    const gCashFee = `&fee=${this.appconfig.config.gCashConfig.fee}`;
    const gCashExpiry = `&expiry=${this.appconfig.config.gCashConfig.expiry}`;
    const dateStr = `${this.formData.appointmentDate} ${this.formData.time}`;
    // eslint-disable-next-line max-len
    const gCashDesc = `&description=Payments for appointment with service type: ${service.name}, on ${moment(dateStr).format('MMMM DD, YYYY h:mm a')}`;
    const url = `${this.appconfig.config.gCashConfig.url}${publicKey}${gCashAmount}${gCashFee}${gCashExpiry}${gCashDesc}`;
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

  async openTimeSlotModal() {
    this.isTimeSlotModalOpen = this.appointmentForm.value.serviceType.serviceTypeId ? true : false;
    if(this.isTimeSlotModalOpen) {
      const selectedDate = this.selectTimeSlotForm.value.selectTimeSlotDate;
      const durationInHours = this.appointmentForm.value.serviceType.durationInHours;
      await this.getAppointmentsForADay(moment(selectedDate).format('YYYY-MM-DD'), this.timeSlotOptions(durationInHours));
      this.selectTimeSlotForm.get('selectTimeSlotDate').valueChanges.subscribe(async selectedValue => {
        this.selectTimeSlotForm.controls.selectTime.setValue(null);
        const dayOfWeek = new Date(selectedValue).toLocaleDateString('en-US', { weekday: 'long' });
        const isDayAvailable = this.appconfig.config.appointmentConfig.dayOfWeekNotAvailable
                                .filter(x=>x.toLowerCase().includes(dayOfWeek.toLowerCase())).length <= 0;
        if(isDayAvailable) {
          await this.getAppointmentsForADay(moment(selectedValue).format('YYYY-MM-DD'), this.timeSlotOptions(durationInHours));
        } else {
          this.availableTimeSlot = [];
        }
      });
    }
  }

  confirmSelectedTimeSlot() {
    const selectedTimeSlotData = this.selectTimeSlotForm.value;
    const appointmentDateAndTime = new Date(
      moment(
        moment(selectedTimeSlotData.selectTimeSlotDate).format('YYYY-MM-DD') +
      ' ' +
      selectedTimeSlotData.selectTime).format('YYYY-MM-DD HH:mm')).toISOString();
    this.appointmentForm.controls.appointmentDate.setValue(appointmentDateAndTime);
    this.appointmentForm.controls.time.setValue(appointmentDateAndTime);
    this.isTimeSlotModalOpen = false;
  }

  closeSelectedTimeSlot() {
    this.isTimeSlotModalOpen = false;
    if(!this.formData.appointmentDate && !this.formData.time) {
      this.selectTimeSlotForm.controls.selectTime.setValue(null);
    }
  }

  onTimeSlotWillDismiss(event) {
    console.log(event);
  }

  cancelTimeSlotModal() {
    this.timeSlotModal.dismiss(null, 'cancel');
  }

  toMinutes = str => str.split(':').reduce((h, m) => h * 60 + +m);

  toString = min => (Math.floor(min / 60) + ':' + (min % 60))
                         .replace(/\b\d\b/, '0$&');

  // eslint-disable-next-line @typescript-eslint/member-ordering
  timeSlotOptions(hours = 1) {
    const notAvailableHours = this.appconfig.config.appointmentConfig.timeSlotNotAvailableHours;
    const start = this.toMinutes(this.appconfig.config.appointmentConfig.timeSlotHours.start);
    const end = this.toMinutes(this.appconfig.config.appointmentConfig.timeSlotHours.end);
    const slotOptions = Array.from({length: Math.floor((end - start) / (60 * Number(hours))) + 1}, (_, i) =>
    this.toString(start + i * (60 * Number(hours))));
    return slotOptions.filter(x=> !notAvailableHours.includes(x));
  }

  tConvert(time) {
    if(time.toLowerCase().includes('invalid date')) {return;};
    time = time.split(':')[1].charAt(1) ? time : time + '0';
    // Check correct time format and split into components
    time = time.toString().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  async getAppointmentsForADay(dateString: string, timeSlotOptions: string[]) {
    try{
      this.isLoading = true;
      await this.appointmentService.getAppointmentsForADay(dateString)
      .subscribe(async res => {
        if(res.success){
          const hSlotTaken = res.data.map((a)=> {
            const appointmentTimeStart = moment(`${a.appointmentDate} ${a.timeStart}`).format('HH');
            const appointmentTimeEnd = moment(`${a.appointmentDate} ${a.timeEnd}`).format('HH');
            return {
              appointmentTimeStart,
              appointmentTimeEnd
            };
          });

          this.availableTimeSlot = timeSlotOptions.map((t)=> {
            const h = t.split(':')[0];
            if(hSlotTaken
            .filter(x=> Number(h) >= Number(x.appointmentTimeStart) && Number(h) < Number(x.appointmentTimeEnd)).length <= 0) {
              return t;
            }
          }).filter(x=>x !== null && x !== undefined && x !== '');

          this.isLoading = false;
        }
        else{
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
          this.isLoading = false;
        }
      }, async (e) => {
        await this.presentAlert({
          header: 'Try again!',
          subHeader: '',
          message: Array.isArray(e.message) ? e.message[0] : e.message,
          buttons: ['OK']
        });
        this.isLoading = false;
      });
    }
    catch(e){
      console.log(e);
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
