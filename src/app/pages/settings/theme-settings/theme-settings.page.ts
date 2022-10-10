import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StorageService } from '../../../core/storage/storage.service';

@Component({
  selector: 'app-theme-settings',
  templateUrl: './theme-settings.page.html',
  styleUrls: ['./theme-settings.page.scss'],
})
export class ThemeSettingsPage implements OnInit {
  user = {};
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService) { }

  ngOnInit() {
    this.user = this.storageService.getLoginUser();
  }
}
