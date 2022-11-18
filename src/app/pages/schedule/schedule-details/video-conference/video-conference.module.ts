import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoConferencePageRoutingModule } from './video-conference-routing.module';

import { VideoConferencePage } from './video-conference.page';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { MaterialModule } from 'src/app/material/material.module';
import { WebrtcService } from 'src/app/core/services/webrtc.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoConferencePageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
  ],
  providers: [
    WebrtcService
  ]
  ,
  declarations: [VideoConferencePage]
})
export class VideoConferencePageModule {}
