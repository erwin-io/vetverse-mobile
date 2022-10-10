import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PageLoaderComponent } from 'src/app/component/page-loader/page-loader.component';

@Injectable({
  providedIn: 'root'
})
export class PageLoaderService {
  private modal: HTMLIonModalElement;
  constructor(private modalCtrl: ModalController) {}

  async open(message) {
    this.modal = await this.modalCtrl.create({
      component: PageLoaderComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        message
      },
    }, );
    this.modal.present();
  }
  async close() {
    setTimeout(async ()=>{
      this.modal.dismiss();
    },500);
  }
}
