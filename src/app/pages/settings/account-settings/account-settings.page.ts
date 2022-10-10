import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StorageService } from '../../../core/storage/storage.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {
  user = {};
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService) { }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }
}
