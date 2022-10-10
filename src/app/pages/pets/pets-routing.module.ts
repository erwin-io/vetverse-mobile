import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetsPage } from './pets.page';

const routes: Routes = [
  {
    path: '',
    component: PetsPage
  },  {
    path: 'pet-details',
    loadChildren: () => import('./pet-details/pet-details.module').then( m => m.PetDetailsPageModule)
  },
  {
    path: 'pet-add',
    loadChildren: () => import('./pet-add/pet-add.module').then( m => m.PetAddPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetsPageRoutingModule {}
