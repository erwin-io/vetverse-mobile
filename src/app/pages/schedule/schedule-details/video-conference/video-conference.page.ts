import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonMenu, IonModal, ModalController } from '@ionic/angular';
import { Observable, fromEvent, merge, Observer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { WebrtcService } from 'src/app/core/services/webrtc.service';

@Component({
  selector: 'app-video-conference',
  templateUrl: './video-conference.page.html',
  styleUrls: ['./video-conference.page.scss'],
})
export class VideoConferencePage implements OnInit, OnDestroy {
  topVideoFrame = 'partner-video';
  isMicOff = false;
  error;
  partnerWebRTCUserId;
  myWebRTCUserId;
  appointmentId: string;
  myEl: HTMLMediaElement;
  partnerEl: HTMLMediaElement;
  constructor(private webrtcService: WebrtcService,
    public elRef: ElementRef,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private appointmentService: AppointmentService) {
    }

  ngOnInit() {
    console.log('appointmentId ', this.appointmentId);
    console.log('myWebRTCUserId ', this.myWebRTCUserId);
    console.log('partnerWebRTCUserId ', this.partnerWebRTCUserId);
    this.myEl = this.elRef.nativeElement.querySelector('#my-video');
    this.partnerEl = this.elRef.nativeElement.querySelector('#partner-video');

    this.webrtcService.init(this.myWebRTCUserId, this.myEl, this.partnerEl);

  }


  call() {
    console.log(this.webrtcService.partnerEl.srcObject);
    this.webrtcService.call(this.partnerWebRTCUserId);
    this.swapVideo('my-video');
  }

  swapVideo(topVideo: string) {
    this.topVideoFrame = topVideo;
  }

  ngOnDestroy(): void {
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

}
