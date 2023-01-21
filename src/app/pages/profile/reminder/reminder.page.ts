/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModalController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import 'moment-timezone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { formatDate } from '@angular/common';
import {
  ClientReminders,
  ClientReminderType,
  DurationType,
  RepeatType,
} from 'src/app/core/model/client-reminder.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { TouchSequence } from 'selenium-webdriver';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ClientReminderDurationTypeCodeEnum, ClientReminderRepeatTypeCodeEnum } from 'src/app/core/enums/client-reminder.enum';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ClientReminderService } from 'src/app/core/services/client-reminder.service';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-notification',
  templateUrl: './reminder.page.html',
  styleUrls: ['./reminder.page.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ReminderPage implements OnInit {
  currentUser: LoginResult;
  modal: HTMLIonModalElement;
  details: ClientReminders;
  isLoading = false;
  error: any;
  refreshEvent: any;
  currentPage = 1;
  limit = 10;
  reminderForm: FormGroup;
  isNew = true;
  minDate = new Date(Date.UTC(new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate(),
  new Date().getHours(),
  new Date().getMinutes(),
  new Date().getSeconds(),
  new Date().getMilliseconds()));
  private repeatTypeData: RepeatType[] = [];
  private durationTypeData: DurationType[] = [];
  private clientReminderTypeData: ClientReminderType[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private appConfigService: AppConfigService,
    private storageService: StorageService,
    private calendar: Calendar,
    private clientReminderService: ClientReminderService,
  ) {
    this.currentUser = this.storageService.getLoginUser();
    this.repeatTypeData = this.appConfigService.config.lookup.repeatType;
    this.durationTypeData = this.appConfigService.config.lookup.durationType;
    this.clientReminderTypeData =
      this.appConfigService.config.lookup.clientReminderType;
    this.reminderForm = this.formBuilder.group({
      startDate: [new Date(this.minDate).toISOString(), Validators.required],
      endDate: [new Date(this.minDate).toISOString()],
      description: [null],
      clientReminderTypeId: [null, [Validators.required]],
      repeatTypeCode: [''],
      durationTypeCode: [null],
      interval: [1],
    });
    this.reminderForm.controls.clientReminderTypeId.valueChanges.subscribe(
      (newValue) => {
        console.log(newValue);
      }
    );
    this.reminderForm.controls.repeatTypeCode.valueChanges.subscribe(
      (newValue) => {
        console.log(newValue);
        const date = new Date(this.formData.startDate);
        const interval = this.formData.interval ? Number(this.formData.interval) : 1;
        if(newValue && newValue === ClientReminderRepeatTypeCodeEnum.WEEKLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + (interval * 7))).toISOString());
        }
        else if(newValue &&newValue === ClientReminderRepeatTypeCodeEnum.MONTHLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setMonth(date.getMonth() + interval)).toISOString());
        }
        else if(newValue && newValue === ClientReminderRepeatTypeCodeEnum.YEARLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setFullYear(date.getFullYear() + interval)).toISOString());
        }
        else {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + interval)).toISOString());
        }
      }
    );
    this.reminderForm.controls.durationTypeCode.valueChanges.subscribe(
      (newValue) => {
        console.log(newValue);
      }
    );
    this.reminderForm.controls.startDate.valueChanges.subscribe(
      (newValue) => {
        console.log(newValue);
        const date = new Date(newValue);
        const interval = this.formData.interval ? Number(this.formData.interval) : 1;
        if(this.formData.repeatTypeCode &&this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.WEEKLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + (interval * 7))).toISOString());
        }
        else if(this.formData.repeatTypeCode &&this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.MONTHLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setMonth(date.getMonth() + interval)).toISOString());
        }
        else if(this.formData.repeatTypeCode &&this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.YEARLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setFullYear(date.getFullYear() + interval)).toISOString());
        }
        else {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + interval)).toISOString());
        }
      }
    );
    this.reminderForm.controls.interval.valueChanges.subscribe(
      (newValue) => {
        console.log(newValue);
        const interval = newValue ? Number(newValue) > 0 ? Number(newValue) : 1 : 1;
        const date = new Date(this.formData.startDate);
        if(this.formData.repeatTypeCode &&this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.WEEKLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + (interval * 7))).toISOString());
        }
        else if(this.formData.repeatTypeCode && this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.MONTHLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setMonth(date.getMonth() + interval)).toISOString());
        }
        else if(this.formData.repeatTypeCode && this.formData.repeatTypeCode === ClientReminderRepeatTypeCodeEnum.YEARLY) {
          this.reminderForm.controls.endDate.setValue(new Date(date.setFullYear(date.getFullYear() + interval)).toISOString());
        }
        else {
          this.reminderForm.controls.endDate.setValue(new Date(date.setDate(date.getDate() + interval)).toISOString());
        }
      }
    );
  }

  get formData() {
    return {
      clientId: this.currentUser.clientId,
      ...this.reminderForm.value,
      id: this.isNew ? uuid() : this.details.id,
    };
  }

  get errorControls() {
    return this.reminderForm.controls;
  }

  get clientReminderTypeOption() {
    return this.clientReminderTypeData;
  }

  get repeatTypeOption() {
    return this.repeatTypeData;
  }

  get durationTypeOption() {
    return this.durationTypeData;
  }

  get every() {
    if(!this.formData.repeatTypeCode || this.formData.repeatTypeCode === '') {return '';}
    if(this.formData.repeatTypeCode === 'yearly') {
      return 'years';
    } else if(this.formData.repeatTypeCode === 'monthly') {
      return 'month';
    } else if(this.formData.repeatTypeCode === 'weekly') {
      return 'week';
    } else {
      return 'days';
    }
  }

  ngOnInit() {
    console.log(this.details);
    if(!this.isNew && this.details) {
      const clientReminderTypeId = this.details.clientReminderType.clientReminderTypeId;
      this.reminderForm.controls.clientReminderTypeId.setValue(clientReminderTypeId);
      // this.reminderForm.controls.startDate.setValue(this.getISODate(this.details.startDate));
      this.reminderForm.controls.startDate.setValue(this.details.startDate);
      this.reminderForm.controls.endDate.setValue(this.getISODate(this.details.endDate));
      this.reminderForm.controls.description.setValue(this.details.description);
      this.reminderForm.controls.repeatTypeCode.setValue(this.details.repeatTypeCode);
      this.reminderForm.controls.durationTypeCode.setValue(this.details.durationTypeCode);
      this.reminderForm.controls.interval.setValue(this.details.interval);
    }

  }

  getISODate(date) {
    return new Date(Date.UTC(new Date(date).getFullYear(),
    new Date(date).getMonth(),
    new Date(date).getDate(),
    new Date(date).getHours(),
    new Date(date).getMinutes(),
    new Date(date).getSeconds(),
    new Date(date).getMilliseconds())).toISOString();
  }

  getDateTimeDisplay(date) {
    return moment(this.getISODate(date)).tz('Pacific/Apia').format('ddd, MMM DD hh:mm a');
  }

  async onDelete() {
    if (Capacitor.platform !== 'web') {
      await this.calendar.deleteEvent(this.details.clientReminderType.name,
        '', this.details.description, new Date(this.details.startDate), new Date(this.details.endDate)).then(()=> {
          const result = this.clientReminderService.delete(this.details.id);
          this.modal.dismiss(result);
        });
    } else {
      const result = this.clientReminderService.delete(this.details.id);
      this.modal.dismiss(result);
    }
  }

  async onSubmit() {
    try {
      const params = this.formData;
      console.log(params);
      const reminder = new ClientReminders();
      reminder.id = params.id;
      reminder.startDate = new Date(params.startDate);
      reminder.endDate = Date.parse(params.endDate) > Date.parse(params.endDate) ? new Date(params.endDate) : new Date(params.startDate);
      reminder.description = params.description;
      reminder.repeatTypeCode = params.repeatTypeCode && params.repeatTypeCode !== '' ?
                                  params.repeatTypeCode :
                                  ClientReminderRepeatTypeCodeEnum.DONTREPEAT;
      reminder.durationTypeCode = params.durationTypeCode;
      reminder.clientReminderType = this.clientReminderTypeOption.filter(x=>x.clientReminderTypeId ===  params.clientReminderTypeId)[0];
      reminder.interval = params.interval;
      console.log(reminder);

      if (Capacitor.platform !== 'web') {
        if(this.isNew) {
          this.scheduleReminder(reminder);
        }
        else {
          this.reSchedule(reminder);
        }
      }
      else {
        if(this.isNew) {
          const result = await this.clientReminderService.save(reminder);
          this.modal.dismiss(result);
        }
        else {
          const result = await this.clientReminderService.update(reminder);
          this.modal.dismiss(result);
        }
      }
    } catch(e) {
      console.log(JSON.stringify(e));
      alert(JSON.stringify(e));
      this.presentAlert(e);
      await this.presentAlert({
        header: 'Try again!',
        message: e.message ? e.message : 'Oops! currently unable to save the reminder.',
        buttons: ['OK']
      });
    }
  }

  async scheduleReminder(params: ClientReminders) {
    const recurrence = params.repeatTypeCode !== ClientReminderRepeatTypeCodeEnum.DONTREPEAT ? params.repeatTypeCode: null;
    await this.calendar.createEventWithOptions(params.clientReminderType.name, '', params.description, params.startDate, params.endDate, {
      calendarId: 1,
      recurrence,
      firstReminderMinutes: 0,
      secondReminderMinutes: 0,
    }).then(async res=>{
      console.log(res);
      params.eventId = res;
      const result = await this.clientReminderService.save(params);
      this.modal.dismiss(result);
    });
  }

  async reSchedule(params: ClientReminders) {
    const recurrence = params.repeatTypeCode !== ClientReminderRepeatTypeCodeEnum.DONTREPEAT ? params.repeatTypeCode: null;
    let recurrenceEndDate = null;
    if(params.repeatTypeCode !== ClientReminderRepeatTypeCodeEnum.DONTREPEAT &&
       params.durationTypeCode === ClientReminderDurationTypeCodeEnum.UNTILENDDATE) {
      recurrenceEndDate = params.endDate;
    }

    await this.calendar.deleteEvent(params.clientReminderType.name,
      '', this.details.description, new Date(this.details.startDate), new Date(this.details.endDate));
    await this.calendar.createEventWithOptions(params.clientReminderType.name, '', params.description, params.startDate, params.endDate, {
      calendarId: 1,
      recurrence,
      recurrenceEndDate,
      recurrenceInterval: params.interval,
      firstReminderMinutes: 0,
      secondReminderMinutes: 0,
    }).then(async res=>{
      console.log(res);
      params.eventId = res;
      const result = await this.clientReminderService.update(params);
      this.modal.dismiss(result);
    });
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
}
