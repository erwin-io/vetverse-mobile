import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, NavController, NavParams, ToastController } from '@ionic/angular';
import { Appointment } from 'src/app/core/model/appointment.model';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { Messages } from 'src/app/core/model/message.model';
import { MessageService } from 'src/app/core/services/message.service';
import { CustomSocket } from 'src/app/core/sockets/custom-socket.sockets';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-contact-vet',
  templateUrl: './contact-vet.page.html',
  styleUrls: ['./contact-vet.page.scss'],
})
export class ContactVetPage implements OnInit {
  // @ViewChild('content', { static: false }) content: ElementRef<IonContent>;
  @ViewChild(IonContent) content: IonContent;
  modal;
  details: Appointment;
  currentUser: LoginResult;
  messages: any[] = [];
  currentMessagePage = 0;
  loadingMessage = false;
  isSendingMessage = false;
  conferenceWebURL;
  error;
  constructor(
    private socket: CustomSocket,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertController: AlertController,
    private messageService: MessageService,
    private toastController: ToastController,
    private storageService: StorageService) {
      this.currentUser = this.storageService.getLoginUser();
    }

  ngOnInit() {
    this.socket.init();
    this.initMessages(this.details.appointmentId);
    this.socket.fromEvent('messageAdded').subscribe((message) => {
      console.log(message);
      const newMessages: Messages[] = [];
      newMessages.push(message as Messages);
      this.messages = [ ...newMessages, ...this.messages ];
    });
  }

  close() {
    this.socket.disconnect();
    this.modal.dismiss(null, 'cancel');
  }

  async initMessages(appointmentId) {
    this.loadingMessage = true;
    try {
      this.messageService.getByAppointmentPage({
        appointmentId,
        page: this.currentMessagePage,
        limit: 40
      }).subscribe(
        async (res) => {
          if (res.success) {
            this.messages = [ ...this.messages, ...res.data.items ];
            this.currentMessagePage = res.data.meta.currentPage;
            this.loadingMessage = false;
          } else {
            this.loadingMessage = false;
            this.error = Array.isArray(res.message)
              ? res.message[0]
              : res.message;
              await this.presentAlert({
                header: 'Try again!',
                subHeader: '',
                message: this.error,
                buttons: ['OK']
              });
          }
        },
        async (err) => {
          this.loadingMessage = false;
          this.error = Array.isArray(err.message)
            ? err.message[0]
            : err.message;
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: this.error,
            buttons: ['OK']
          });
        }
      );
    } catch (e) {
      this.loadingMessage = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: this.error,
        buttons: ['OK']
      });
    }
  }

  async sendMessage(messageInput) {
    const message = messageInput.value;
    const param = {
      message,
      isClient: true,
      appointmentId: this.details.appointmentId,
      fromUserId: this.currentUser.userId,
      toUserId: this.details.staff.user.userId,
    };
    this.isSendingMessage = true;
    const messages: any [] = [];
    messages.push({
      message,
      dateTime: new Date(),
      fromUser: { userId: this.currentUser.userId },
      isClient: true,
      isSending: true
    });
    this.messages = [...messages,...this.messages];
    try {
      await this.
      messageService
        .add(param)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.isSendingMessage = false;
            } else {
              this.isSendingMessage = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.presentToast(this.error);
            }
            this.messages.filter(x=> Number(x.fromUser.userId) === Number(this.currentUser.userId))[0].isSending = false;
          },
          async (err) => {
            this.isSendingMessage = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.presentToast(this.error);
          }
        );
    } catch (e) {
      this.isSendingMessage = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.presentToast(this.error);
    }
    messageInput.value = null;
  }


  async loadMoreMessage() {
    this.currentMessagePage = this.currentMessagePage + 1;
    this.initMessages(this.details.appointmentId);
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }

  async joinVideoConference() {
    await Browser.open({ url: this.conferenceWebURL });
  }

  private async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

}
