import { TestBed } from '@angular/core/testing';

import { ClientReminderService } from './client-reminder.service';

describe('ClientReminderService', () => {
  let service: ClientReminderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientReminderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
