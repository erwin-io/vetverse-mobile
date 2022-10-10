import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from '../../core/storage/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  user: LoginResult;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService) { }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }

  onSettingsMenuClick(item: string){
    this.navCtrl.navigateForward([item]);
  }

  signout(){
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }
}
