/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from '../../core/storage/storage.service';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {

  }

  get user(): LoginResult {
    return this.storageService.getLoginUser();
  }

  ngOnInit() {}
  async onShowSettings() {
    // this.router.navigate(['settings'], { replaceUrl: true });

    let modal: any = null;
    modal = await this.modalCtrl.create({
      component: SettingsPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      componentProps: { modal },
    });
    modal.present();
  }

  ionViewWillEnter() {
    console.log('visited');
  }
}
