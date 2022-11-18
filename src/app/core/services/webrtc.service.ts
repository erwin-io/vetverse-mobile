import { Injectable } from '@angular/core';
import { Peer, MediaConnection, PeerJSOption } from 'peerjs';

const constraints: MediaStreamConstraints = {video: true, audio: false};

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  peer: Peer;
  myStream: MediaStream;
  myEl: HTMLMediaElement;
  partnerEl: HTMLMediaElement;

  stun = 'stun.l.google.com:19302';
  mediaConnection: MediaConnection;
  options: PeerJSOption;
  stunServer: RTCIceServer = {
    urls: 'stun:' + this.stun,
  };

  constructor() {

    this.options = {  // not used, by default it'll use peerjs server
      key: 'cd1ft79ro8g833di',
      debug: 3
    };
  }

  async getMedia() {
    try {

        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream)=> {
            this.handleSuccess(stream);
      }).catch((error)=> {
          this.handleError(error);
        });
    }catch(err) {
      this.handleError(err);
    }
    // this.myStream = stream;
    // this.myEl.srcObject = stream;
  }

  async init(userId: string, myEl: HTMLMediaElement, partnerEl: HTMLMediaElement) {
    this.myEl = myEl;
    this.partnerEl = partnerEl;
    try {
      this.getMedia();
    } catch (e) {
      this.handleError(e);
    }
    await this.createPeer(userId);
  }

  async createPeer(userId: string) {
    this.peer = new Peer(userId);
    this.peer.on('open', () => {
      this.wait();
    });
  }

  call(partnerId: string) {
    const call = this.peer.call(partnerId, this.myStream);
    call.on('stream', (stream) => {
      this.partnerEl.srcObject = stream;
    });
  }

  wait() {
    this.peer.on('call', (call) => {
      call.answer(this.myStream);
      call.on('stream', (stream) => {
        this.partnerEl.srcObject = stream;
      });
    });
  }

  handleSuccess(stream: MediaStream) {
    this.myStream = stream;
    this.myEl.srcObject = stream;
  }

  handleError(error: any) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      const v = constraints.video;
     // this.errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
      this.errorMsg(`The resolution px is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      this.errorMsg('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.');
    }
    this.errorMsg(`getUserMedia error: ${error.name}`, error);
  }

  errorMsg(msg: string, error?: any) {
    alert(error);
  }
}
