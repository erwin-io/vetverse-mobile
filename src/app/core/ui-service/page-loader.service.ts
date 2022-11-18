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
      this.modal.dismiss();
    }
    this.modal = await this.modalCtrl.create({
      component: PageLoaderComponent,
      cssClass: 'modal-fullscreen',
      canDismiss: false,
      componentProps: {
        message
      },
    }, );
    this.modal.present();
  }
  async close() {
    setTimeout(async ()=>{
      if(this.modal){
        this.modal.canDismiss = true;
        this.modal.dismiss();
      }
    },500);
  }
}
