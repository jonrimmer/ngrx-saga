import { TestBed } from '@angular/core/testing';

import { App.SagasService } from './app.sagas.service';

describe('App.SagasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: App.SagasService = TestBed.get(App.SagasService);
    expect(service).toBeTruthy();
  });
});
