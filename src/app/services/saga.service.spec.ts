import { TestBed } from '@angular/core/testing';

import { SagaService } from './saga.service';

describe('SagaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SagaService = TestBed.get(SagaService);
    expect(service).toBeTruthy();
  });
});
