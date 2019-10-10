import { TestBed } from '@angular/core/testing';

import { ShaderService } from './shader.service';

describe('ShaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShaderService = TestBed.get(ShaderService);
    expect(service).toBeTruthy();
  });
});
