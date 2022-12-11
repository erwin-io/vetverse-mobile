import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonToggle, NavController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from '../../../core/storage/storage.service';

@Component({
  selector: 'app-theme-settings',
  templateUrl: './theme-settings.page.html',
  styleUrls: ['./theme-settings.page.scss'],
})
export class ThemeSettingsPage implements OnInit {
	@ViewChild('toggleDarkModeCtrl', { static: true }) toggleDarkModeCtrl: ElementRef<IonToggle>;
  modal;
  user: LoginResult;
  isLoading = false;
  isDarkEnable;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService
  ) {
    this.isLoading = true;
    this.isDarkEnable = false;
    this.isDarkEnable = this.storageService.getThemeIsDarkMode();
    setTimeout(()=> {
      this.isLoading = false;
    }, 500);
  }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }


  toggleDarkMode() {
    if(!this.isLoading) {
      const isDarkEnable = this.toggleDarkModeCtrl.nativeElement.checked;
      console.log('isDarkEnable', isDarkEnable);
      document.body.classList.toggle('dark', isDarkEnable);
      if (isDarkEnable) {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.setAttribute('data-theme', 'light');
      }
      this.storageService.saveThemeIsDarkMode(isDarkEnable);
    }
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }
}
