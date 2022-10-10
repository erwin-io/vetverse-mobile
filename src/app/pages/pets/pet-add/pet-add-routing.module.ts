import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetAddPage } from './pet-add.page';

const routes: Routes = [
  {
    path: '',
    component: PetAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetAddPageRoutingModule {}
