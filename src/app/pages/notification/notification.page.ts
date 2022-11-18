/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { Notifications } from 'src/app/core/model/notification.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import { ScheduleDetailsPage } from '../schedule/schedule-details/schedule-details.page';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class NotificationPage implements OnInit {
  currentUser: LoginResult;
  data: Notifications[] = [];
  isLoading = false;
  error: any;
  refreshEvent: any;
  currentPage = 1;
  limit = 10;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private alertController: AlertController,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private actionSheetCtrl: ActionSheetController) {
      this.currentUser = this.storageService.getLoginUser();
      this.loadNotif(this.currentUser.clientId);
    }

  ngOnInit() {
  }

  async loadNotif(clientId: string){
    try {
      this.isLoading = true;
      this.notificationService.getAllByClientIdPage({ clientId, page: this.currentPage, limit: this.limit }).subscribe((res)=> {
        if(res.success){
          console.log(res.data.items);
          this.data = [ ...this.data, ...res.data.items ];
          if(this.refreshEvent) {
            this.refreshEvent.target.complete();
            this.refreshEvent = null;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message)
            ? res.message[0]
            : res.message;
          this.presentAlert(this.error);
        }
      },
      async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        this.presentAlert(this.error);
      });
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.presentAlert(this.error);
    }
  }

  async openDetails(notifDetails) {
    try{
      await this.pageLoaderService.open('Please waa!...');
      this.isLoading = true;
      this.notificationService.updateReadStatus({ notificationId : notifDetails.notificationId })
        .subscribe(async res => {
          if (res.success) {
            this.data.filter(x=>x.notificationId === notifDetails.notificationId)[0].isRead = true;
            await this.pageLoaderService.close();
            this.isLoading = false;
            const modal = await this.modalCtrl.create({
              component: ScheduleDetailsPage,
              cssClass: 'modal-fullscreen',
              componentProps: { details: notifDetails.appointment },
            });
            modal.present();
            await modal.onWillDismiss();
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

  async loadMore() {
    this.currentPage = this.currentPage + 1;
    this.loadNotif(this.currentUser.clientId);
  }

  async doRefresh(event){
    this.data = [];
    this.currentPage = 1;
    this.refreshEvent = event;
    await this.loadNotif(this.currentUser.clientId);
 }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}