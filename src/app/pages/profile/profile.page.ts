import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { StorageService } from '../../core/storage/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: LoginResult;
  constructor(private router: Router,
               private storageService: StorageService) {
                this.user = this.storageService.getLoginUser();
              }

  ngOnInit() {
  }
  onShowSettings(){
    this.router.navigate(['settings'], { replaceUrl: true });
  }

}
