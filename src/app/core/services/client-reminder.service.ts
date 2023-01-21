import { Injectable } from '@angular/core';
import { ClientReminders } from '../model/client-reminder.model';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ClientReminderService {

  constructor(
    private storageService: StorageService,) { }


  async getAll(): Promise<ClientReminders[]> {
    const data = this.storageService.getClientReminder();
    if(!data || !Array.isArray(data)) {
      return [] as ClientReminders[];
    } else {return data as ClientReminders[];}
  }

  async save(data: ClientReminders) {
    const current = await this.getAll();
    if(current && current.length > 0 && data.id !== '' && current.filter(x=>x.id === data.id)) {
      const newArray = current.filter(x=>x.id !== data.id);
      newArray.push(data);
      this.storageService.saveClientReminder(newArray);
      return this.getAll();
    }
    else {
      current.push(data);
      this.storageService.saveClientReminder(current);
      return this.getAll();
    }
  }

  async update(data: ClientReminders) {
    const current = await this.getAll();
    if(current.length > 0 && data.id !== '' && current.filter(x=>x.id === data.id)) {
      const newArray = current.filter(x=>x.id !== data.id);
      newArray.push(data);
      this.storageService.saveClientReminder(newArray);
    }
    return this.getAll();
  }

  async delete(id) {
    const current = await this.getAll();
    if(current.length > 0 && id !== '' && current.filter(x=>x.id === id)) {
      const newArray = current.filter(x=>x.id !== id);
      this.storageService.saveClientReminder(newArray);
    }
    return this.getAll();
  }
}
