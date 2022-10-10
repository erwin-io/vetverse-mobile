import { TestBed } from '@angular/core/testing';

import { PetTypeService } from './pet-type.service';

describe('PetTypeService', () => {
  let service: PetTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
