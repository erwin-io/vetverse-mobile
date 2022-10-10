import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss'],
})
export class NavigationPage implements OnInit {
  active = '';
  constructor() {
    }

  ngOnInit() {
  }
  onTabsWillChange(event) {
    this.active = event.tab;
  }

}
