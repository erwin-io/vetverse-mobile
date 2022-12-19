import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from '../../core/storage/storage.service';
import { PasswordAndSecurityPage } from './password-and-security/password-and-security.page';
import { ProfileSettingsPage } from './profile-settings/profile-settings.page';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  user: LoginResult;
  modal: HTMLIonModalElement;
  routerOutlet: any;
  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      this.close();
    });
  }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }

  async onSettingsMenuClick(item: string) {
    // this.navCtrl.navigateForward([item]);
    let modal: any = null;
    switch (item) {
      case 'profile-settings':
        modal = await this.modalCtrl.create({
          component: ProfileSettingsPage,
          cssClass: 'modal-fullscreen',
          backdropDismiss: false,
          canDismiss: true,
          componentProps: { modal },
        });
        modal.onWillDismiss().then((res: { data: any; role: string }) => {
          if(res.data && res.role === 'confirm') {
            this.user = this.storageService.getLoginUser();
          }
        });
        modal.present();
        break;
      case 'password-and-security':
        modal = await this.modalCtrl.create({
          component: PasswordAndSecurityPage,
          cssClass: 'modal-fullscreen',
          backdropDismiss: false,
          canDismiss: true,
          componentProps: { modal },
        });
        modal.present();
        break;
    }
  }

  signout() {
    this.authService.logout();
  }

  ionViewWillEnter() {;
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  toggleDarkMode() {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addListener((mediaQuery) =>
      this.toggleDarkTheme(mediaQuery.matches)
    );
  }

  // Add or remove the "dark" class based on if the media query matches
  toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
  }
}
