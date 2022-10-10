import { TestBed } from '@angular/core/testing';

import { PetCategoryService } from './pet-category.service';

describe('PetCategoryService', () => {
  let service: PetCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
