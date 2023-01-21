import { ClientReminderDurationTypeCodeEnum, ClientReminderRepeatTypeCodeEnum } from '../enums/client-reminder.enum';
import { Client } from './client.model';

export class ClientReminders {
    id?: string;
    eventId: string;
    clientReminderId?: string;
    startDate: Date;
    remindDateTime: Date;
    endDate?: Date;
    repeatTypeCode: ClientReminderRepeatTypeCodeEnum;
    durationTypeCode: ClientReminderDurationTypeCodeEnum;
    interval: number;
    clientReminderType: ClientReminderType;
    description?: string;
    client?: Client;
    entityStatus?: { entityStatusId: string };
  }

  export class ClientReminderType {
    clientReminderTypeId: string;
    name?: string;
  }

  export class RepeatType {
    repeatTypeCode: string;
    name?: string;
  }
  export class DurationType {
    durationTypeCode: string;
    name?: string;
  }

