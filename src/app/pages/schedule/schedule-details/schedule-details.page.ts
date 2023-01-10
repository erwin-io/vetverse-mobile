import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { Appointment, AppointmentAttachments } from 'src/app/core/model/appointment.model';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { VideoConferencePage } from './video-conference/video-conference.page';
import { WebrtcService } from 'src/app/core/services/webrtc.service';
import { InAppBrowserObject, InAppBrowser } from '@ionic-native/in-app-browser';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { ContactVetPage } from './contact-vet/contact-vet.page';
import { ImageViewerPage } from 'src/app/component/image-viewer/image-viewer.page';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { DiagnosisAttachmentsPage } from './diagnosis-attachments/diagnosis-attachments.page';

@Component({
  selector: 'app-schedule-details',
  templateUrl: './schedule-details.page.html',
  styleUrls: ['./schedule-details.page.scss'],
})
export class ScheduleDetailsPage implements OnInit {
  hasChanges = false;
  currentUser: LoginResult;
  isLoading = false;
  details: Appointment = {} as any;
  conferenceWebURL;
  isLoadingAttachments = false;

  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService,
    private userService: UserService,
    private appconfig: AppConfigService,
    private appointmentService: AppointmentService) {
      this.platform.backButton.subscribeWithPriority(-1, () => {
        this.cancel();
      });
  }

  get appointmentDate(){
    return moment(this.details.appointmentDate).format('dddd, MMM DD, YYYY');
  }
  get time() {
    const timeStart = moment(`${this.details.appointmentDate} ${this.details.timeStart}`).format('h:mm a');
    const timeEnd = moment(`${this.details.appointmentDate} ${this.details.timeEnd}`).format('h:mm a');
    return `${timeStart} - ${timeEnd}`;
  }

  get isVideoConferenceAvailable() {
    if(this.isLoading) {
      return false;
    } else {
      const today: any = new Date();
      const appointmentDateStr = moment(`${this.details.appointmentDate} ${this.details.timeStart}`).format('YYYY-MM-DD h:mm a');
      const date: any = new Date(appointmentDateStr);
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? true : Math.abs(diffTime) <= 600000;
    }
  }

  get isCancellationAvailable() {
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


  ngOnInit() {
    console.log(this.details);
    console.log(this.currentUser);
    this.getAppointment(this.details.appointmentId);

  }

  async getAppointment(appointmentId: string) {
    try{
      this.isLoading = true;
      this.appointmentService.getById(appointmentId)
      .subscribe(async res => {
        console.log(res);
        if(res.success){
          this.details = res.data;
          this.isLoading = false;
          this.conferenceWebURL = `${environment.conferenceHost}video-conference/accept/${res.data.appointmentId}`;
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

  async onCancelAppointment() {
    await this.presentAlert({
      header: 'Are you sure you want to cancel?',
      buttons: [
        {
          text: 'BACK',
          role: 'cancel',
        },
        {
          text: 'YES',
          role: 'confirm',
          handler: async () => {
            this.cancelAppointment();
          },
        },
      ],
    });
  }

  async cancelAppointment(){
    try{
      await this.pageLoaderService.open('Processing please wait...');
      this.isLoading = true;
      this.appointmentService.updateAppointmentStatus({
        appointmentId: this.details.appointmentId,
        appointmentStatusId: '4',
        isUpdatedByClient: true
      })
        .subscribe(async res => {
          if (res.success) {
            this.hasChanges = true;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Appointment cancelled!',
              buttons: ['OK']
            });
            this.isLoading = false;
            this.getClientCancellationAttempt();
          } else {
            await this.pageLoaderService.close();
            this.isLoading = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.pageLoaderService.close();
          this.isLoading = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.pageLoaderService.close();
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async getClientCancellationAttempt() {
    try{
      this.isLoading = true;
      this.userService.getById(this.currentUser.userId)
      .subscribe(async res => {
        if(res.success){
          this.currentUser.numberOfCancelledAttempt = res.data.numberOfCancelledAttempt;
          this.currentUser.lastCancelledDate = res.data.lastCancelledDate;
          this.storageService.saveLoginUser(this.currentUser);
          if(Number(this.currentUser.numberOfCancelledAttempt) >= Number(this.appconfig.config.appointmentConfig.maxCancellation)) {
            await this.presentAlert({
              header: 'Warning!',
              message: `You have reached the maximum number of cancellation of appointments allowed.
              This account is restricted for booking an appointment
              for ${this.appconfig.config.appointmentConfig.daysCancellationLimitReset} day(s).
              Due to violation of cancellation of appointments within the given limit.`,
              buttons: ['OK']
            });
          }
          this.isLoading = false;
          this.getAppointment(this.details.appointmentId);
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

  async joinVideoConference() {
    await Browser.open({ url: this.conferenceWebURL });
  }

  async openVetConnect() {
    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: ContactVetPage,
      cssClass: 'modal-fullscreen',
      componentProps: { modal, currentUser: this.currentUser, details: this.details, conferenceWebURL: this.conferenceWebURL },
    });
    modal.present();
    await modal.onWillDismiss();
  }

  async onAddPhoto() {
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
              const attachmentFile = {
                appointmentId: this.details.appointmentId,
                fileName: `profile-sample-name.${image.format}`,
                data: base64Data,
              };
              this.addAttachmentFile(attachmentFile);
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
              const attachmentFile = {
                appointmentId: this.details.appointmentId,
                fileName: `profile-sample-name.${image.format}`,
                data: base64Data,
              };
              this.addAttachmentFile(attachmentFile);
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


  async onViewImage(attachments) {
    if(attachments.file && attachments.file.url) {
      const modal = await this.modalCtrl.create({
        component: ImageViewerPage,
        cssClass: 'modal-fullscreen',
        componentProps: { file: attachments.file },
      });
      modal.present();
      await modal.onWillDismiss();
    }
  }

  async addAttachmentFile(params) {
    try{
      this.isLoadingAttachments = true;
      this.appointmentService.addAttachmentFile(params)
      .subscribe(async res => {
        if(res.success){
          console.log(res.data);
          this.details.appointmentAttachments = res.data;
          this.isLoadingAttachments = false;
        }
        else{
          this.isLoadingAttachments = false;
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
        this.isLoadingAttachments = false;
      });
    }catch(e) {
      this.isLoadingAttachments = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onRemovePhoto(attachments: AppointmentAttachments) {
    try{
      await this.presentAlert({
        header: 'Are you sure you want to remove photo?',
        buttons: [
          {
            text: 'BACK',
            role: 'cancel',
          },
          {
            text: 'YES',
            role: 'confirm',
            handler: async () => {
              this.isLoadingAttachments = true;
              this.appointmentService.removeAttachmentFile(attachments.appointmentAttachmentId)
              .subscribe(async res => {
                if(res.success){
                  console.log(res.data);
                  this.details.appointmentAttachments = res.data;
                  this.isLoadingAttachments = false;
                }
                else{
                  this.isLoadingAttachments = false;
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
                this.isLoadingAttachments = false;
              });
            },
          },
        ],
      });
    }
    catch(e){
      this.isLoadingAttachments = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }


  async onViewDiagnosisAttachments() {
    if(this.details.diagnosisAttachments) {
      const diagnosisAttachments = this.details.diagnosisAttachments;
      const modal = await this.modalCtrl.create({
        component: DiagnosisAttachmentsPage,
        cssClass: 'modal-fullscreen',
        componentProps: { diagnosisAttachments },
      });
      modal.present();
      await modal.onWillDismiss();
    }
  }

  async profilePicErrorHandler(event) {
    event.target.src = '../../../../assets/img/error_black.png';
  }

  cancel() {
    return this.modalCtrl.dismiss(this.hasChanges ? this.hasChanges : null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

}
