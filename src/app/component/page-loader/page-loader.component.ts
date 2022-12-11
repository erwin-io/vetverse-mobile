import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PageLoaderComponent implements OnInit {
  message = 'Loading...';
  constructor() { }

  ngOnInit() {}

}
