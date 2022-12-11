import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { AddSchedulePage } from './add-schedule/add-schedule.page';
import {map} from 'rxjs/operators';
import { LoaderService } from 'src/app/core/ui-service/loader.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Appointment, Pet, ServiceType } from 'src/app/core/model/appointment.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { SchedulePendingPage } from './schedule-pending/schedule-pending.page';
import { ScheduleDetailsPage } from './schedule-details/schedule-details.page';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { forkJoin, Subscription } from 'rxjs';
import { PetService } from 'src/app/core/services/pet.service';
import { UserService } from 'src/app/core/services/user.service';
import { Staff } from 'src/app/core/model/staff.model';
import { Router } from '@angular/router';
import { ScheduleHistoryPage } from './schedule-history/schedule-history.page';
import { AppConfigService } from 'src/app/core/services/app-config.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SchedulePage implements OnInit {
  selectedStatus: string[] = ['Pending', 'Approved'];
  currentUser: LoginResult;
  isLoading = false;
  appointmentData: Appointment[] = [];
  message = '';
  refreshEvent: any;
  subscription: Subscription;
  private serviceTypeData: ServiceType[] = [];
  private petData: Pet[] = [];
  private vetData: Staff[] = [];
  constructor(private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private storageService: StorageService,
    private serviceTypeService: ServiceTypeService,
    private petService: PetService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private navController: NavController,
    private router: Router,
    private appconfig: AppConfigService,
    public platform: Platform) {
      this.currentUser = this.storageService.getLoginUser();
      this.getAppointment(this.currentUser.clientId);
      this.initLookup();
  }

  get appointment() {
    return this.appointmentData.filter(x=>x.appointmentStatus.appointmentStatusId === '2');
  }

  get totalPending() {
    return this.appointmentData.filter(x=>x.appointmentStatus.appointmentStatusId === '1').length;
  }

  get isBookingAvailable() {
    if(this.isLoading) {
      return false;
    } else {
      const today: any = new Date();
      const date: any = new Date(this.currentUser.lastCancelledDate);
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Number(this.currentUser.numberOfCancelledAttempt) >= Number(this.appconfig.config.appointmentConfig.maxCancellation) ?
      diffDays > Number(this.appconfig.config.appointmentConfig.daysCancellationLimitReset) : true;
    }
  }

  async ngOnInit() {
  }

  ionViewWillEnter(){
    console.log('visited');
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }, false);
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  async initLookup(){
    this.isLoading = true;
    forkJoin(
      this.serviceTypeService.get(),
      this.petService.getByClientId(this.currentUser.clientId),
      this.userService.getStaffByAdvanceSearch({
        isAdvance: true,
        keyword: '',
        userId: '',
        email: '',
        mobileNumber: 0,
        name: '',
        roles: 'Veterinarian'
      }),
  ).subscribe(
      ([getServiceTypeService, getPetService, getVet]) => {
          // do things
          this.serviceTypeData = getServiceTypeService.data;
          this.petData = getPetService.data;
          this.vetData = getVet.data;
      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
      }
  );
  }

  async getAppointment(clientId: string) {
    try{
      this.isLoading = true;
      this.appointmentService.getClientAppointmentsByStatus({
        clientId,
        appointmentStatus: this.selectedStatus.toString()
      })
      .subscribe(async res => {
        if(res.success){
          this.appointmentData = res.data;
          if(this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.refreshEvent = null;
          }
          this.isLoading = false;
        }
        else{
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
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

  async doRefresh(event){
    this.refreshEvent = event;
    await this.getAppointment(this.currentUser.clientId);
    await this.initLookup();
  }

  async showMenu(details){
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [{
          text: 'Details',
          handler:async () => {
            this.onOpenDetails(details);
            actionSheet.dismiss();
          }
        },
        {
          text: 'Back',
          handler:async () => {
            actionSheet.dismiss();
          }
        }
      ]
    });
    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    console.log(result);
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

  async onOpenAdd() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: AddSchedulePage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: false,
      componentProps: {
        modal,
        isNew: true,
        currentUser: this.currentUser,
        serviceTypeOption: this.serviceTypeData,
        petOption: this.petData,
        vetOption: this.vetData,
       },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      await this.getAppointment(this.currentUser.clientId);
      await this.initLookup();
    }
  }

  async onOpenPending() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: SchedulePendingPage,
      cssClass: 'modal-fullscreen',
      componentProps: { currentUser: this.currentUser },
    });
    modal.onWillDismiss().then((res) => {
      if(res.data) {
        this.initLookup().then(()=> {
          this.getAppointment(this.currentUser.clientId);
        });
      }
    });
    modal.present();
    await modal.onWillDismiss();
  }

  async onOpenDetails(details) {
    const modal = await this.modalCtrl.create({
      component: ScheduleDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details, currentUser: this.currentUser },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  async history() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: ScheduleHistoryPage,
      cssClass: 'modal-fullscreen',
      componentProps: { currentUser: this.currentUser },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
