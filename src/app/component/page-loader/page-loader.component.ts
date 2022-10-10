import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PageLoaderComponent implements OnInit {
  message = 'Loading...';
  constructor() { }

  ngOnInit() {}

}
