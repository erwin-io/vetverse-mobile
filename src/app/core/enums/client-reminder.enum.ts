/* eslint-disable @typescript-eslint/naming-convention */
export enum ClientReminderRepeatTypeCodeEnum {
  DONTREPEAT = '',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ClientReminderDurationTypeCodeEnum {
  CONTINUOUS = 'C',
  UNTILENDDATE = 'U',
  SPECIFICTIMES = 'S',
}
