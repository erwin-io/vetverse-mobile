import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SidenavPage } from './sidenav.page';
import { SidenavPageRoutingModule } from './sidenav-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SidenavPageRoutingModule
  ],
  declarations: [SidenavPage]
})
export class SidenavPageModule {}
