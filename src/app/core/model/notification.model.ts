import { Appointment } from './appointment.model';
import { Client } from './client.model';
import { Gender } from './gender.model';
import { User } from './user.model';

export class Notifications {
  notificationId: string;
  date: Date;
  title: string;
  description: any;
  isRead: boolean;
  appointment: Appointment;
  client: Client;
}
