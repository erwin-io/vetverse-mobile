import { Component, OnInit } from '@angular/core';

import { Router, RouterEvent } from '@angular/router';
import { StorageService } from '../../core/storage/storage.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.page.html',
  styleUrls: ['./sidenav.page.scss'],
})

export class SidenavPage implements OnInit {

  active = '';

  navigation = [
    {
      name: 'Home',
      link: '/home',
      icon: 'home'
    },
    {
      name: 'About',
      link: '/about',
      icon: 'person-circle'
    },
    {
      name: 'Blog',
      link: '/blog',
      icon: 'albums'
    },
    {
      name: 'Contact',
      link: '/contact',
      icon: 'call'
    },
    {
      name: 'TodoList',
      link: '/todolist',
      icon: 'checkbox'
    }
  ];

  constructor(
    private router: Router,
    private storageService: StorageService) {
    this.router.events.subscribe((event: RouterEvent) => {
      this.active = event.url;
    });
  }

  ngOnInit() { }

  logout() {
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }
}
