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
    if(this.modal){
      await this.modal.dismiss();
    }
    this.modal = await this.modalCtrl.create({
      component: PageLoaderComponent,
      id: 'page-loader',
      cssClass: 'modal-fullscreen',
      canDismiss: false,
      componentProps: {
        message
      },
    }, );
    this.modal.present();
  }
  async close() {
    this.modal.canDismiss = true;
    await this.modal.dismiss();
  }
}
