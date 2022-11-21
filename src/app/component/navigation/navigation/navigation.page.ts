import { Component, OnInit } from '@angular/core';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StorageService } from 'src/app/core/storage/storage.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss'],
})
export class NavigationPage implements OnInit {
  currentUser: LoginResult;
  active = '';
  // totalUnreadNotification = 0;
  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService) {
      this.currentUser = this.storageService.getLoginUser();
    }

  get totalUnreadNotification() {
    const total = this.storageService.getTotalUnreadNotif();
    return total? total : 0;
  }

  ngOnInit() {
    // setInterval(()=> {
    //   this.getTotalUnreadNotif(this.currentUser.clientId);
    // }, 1000);
  }

  // getTotalUnreadNotif(clientId) {
  //   this.notificationService.getTotalUnreadByClientId({ clientId }).subscribe((res)=> {
  //     if(res.success) {
  //     }
  //   });
  // }

  onTabsWillChange(event) {
    this.active = event.tab;
  }

}
