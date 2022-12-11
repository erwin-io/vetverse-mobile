import { Component, OnInit } from '@angular/core';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from 'src/app/core/storage/storage.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {
  modal;
  user: LoginResult;
  constructor(
    private storageService: StorageService) {
      this.user = this.storageService.getLoginUser();
    }

  ngOnInit() {
  }
  close() {
    this.modal.dismiss(null, 'cancel');
  }

}
