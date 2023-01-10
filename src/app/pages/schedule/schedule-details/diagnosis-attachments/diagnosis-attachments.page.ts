import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ImageViewerPage } from 'src/app/component/image-viewer/image-viewer.page';

@Component({
  selector: 'app-diagnosis-attachments',
  templateUrl: './diagnosis-attachments.page.html',
  styleUrls: ['./diagnosis-attachments.page.scss'],
})
export class DiagnosisAttachmentsPage implements OnInit {
  isLoading =false;
  diagnosisAttachments = [];
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  async onViewImage(attachment) {
    if(attachment) {
      const modal = await this.modalCtrl.create({
        component: ImageViewerPage,
        cssClass: 'modal-fullscreen',
        componentProps: { file: attachment.file },
      });
      modal.present();
      await modal.onWillDismiss();
    }
  }

  async profilePicErrorHandler(event) {
    event.target.src = '../../../../../assets/img/error_black.png';
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
