import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from '../../core/storage/storage.service';
import { PasswordAndSecurityPage } from './password-and-security/password-and-security.page';
import { ProfileSettingsPage } from './profile-settings/profile-settings.page';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  user: LoginResult;
  profilePicSource;
  modal: HTMLIonModalElement;
  routerOutlet: any;
  isSubmitting = false;
  constructor(
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private alertController: AlertController
  ) {
    this.user = this.storageService.getLoginUser();
    this.platform.backButton.subscribeWithPriority(-1, () => {
      this.close();
    });
  }

  ngOnInit() {}

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
          if (res.data && res.role === 'confirm') {
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

  ionViewWillEnter() {}

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

  async onChangeProfilePic() {
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
              this.profilePicSource = base64Data;
              await this.saveProfilePicture(
                {
                  userId: this.user.userId,
                  userProfilePic: {
                    fileName: `profile-sample-name.${image.format}`,
                    data: base64Data,
                  }
                });
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
              console.log(base64Data);
              this.profilePicSource = base64Data;
              await this.saveProfilePicture(
                {
                  userId: this.user.userId,
                  userProfilePic: {
                    fileName: `profile-sample-name.${image.format}`,
                    data: base64Data,
                  }
                });
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../assets/img/pet-profile-not-found.png';
  }

  async saveProfilePicture(params) {
    try {
      this.isSubmitting = true;
      this.userService.updateClientProfilePicture(params).subscribe(
        async (res) => {
          console.log(res);
          if (res.success) {
            console.log(res);
            this.isSubmitting = false;
            this.user.gender = res.data.gender;
            this.user.userProfilePic = res.data.user.userProfilePic.file.url;
            this.storageService.saveLoginUser(this.user);
          } else {
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message)
                ? res.message[0]
                : res.message,
              buttons: ['OK'],
            });
          }
        },
        async (err) => {
          this.isSubmitting = false;
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK'],
          });
        }
      );
    } catch (e) {
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK'],
      });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
