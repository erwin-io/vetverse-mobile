import { Appointment } from './appointment.model';

export class Messages {
  messageId?: string;
  message: string;
  dateTime?: Date;
  appointment?: Appointment;
  fromUser?: any;
  toUser?: any;
  isClient: boolean;
}
