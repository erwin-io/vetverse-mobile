import { Component, OnInit } from '@angular/core';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from 'src/app/core/storage/storage.service';

@Component({
  selector: 'app-password-and-security',
  templateUrl: './password-and-security.page.html',
  styleUrls: ['./password-and-security.page.scss'],
})
export class PasswordAndSecurityPage implements OnInit {
  modal;
  user: LoginResult;

  constructor(
    private storageService: StorageService)  {
      this.user = this.storageService.getLoginUser();
    }

  ngOnInit() {
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }
}
