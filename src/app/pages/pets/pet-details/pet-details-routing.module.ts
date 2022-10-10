import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetDetailsPage } from './pet-details.page';

const routes: Routes = [
  {
    path: '',
    component: PetDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetDetailsPageRoutingModule {}
