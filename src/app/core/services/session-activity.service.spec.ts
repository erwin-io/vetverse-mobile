import { TestBed } from '@angular/core/testing';

import { SessionActivityService } from './session-activity.service';

describe('SessionActivityService', () => {
  let service: SessionActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
