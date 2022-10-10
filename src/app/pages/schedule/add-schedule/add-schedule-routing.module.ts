import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddSchedulePage } from './add-schedule.page';

const routes: Routes = [
  {
    path: '',
    component: AddSchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddSchedulePageRoutingModule {}
