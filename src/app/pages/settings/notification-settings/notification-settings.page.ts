import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StorageService } from '../../../core/storage/storage.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.page.html',
  styleUrls: ['./notification-settings.page.scss'],
})
export class NotificationSettingsPage implements OnInit {
  user = {};
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService) { }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }

}
