import { TestBed } from '@angular/core/testing';

import { GlService } from './gl.service';

describe('GlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlService = TestBed.get(GlService);
    expect(service).toBeTruthy();
  });
});
