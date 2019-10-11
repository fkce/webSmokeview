import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlService {

  // Main webgl object
  gl: WebGLRenderingContext;
  ext_32bit = null;
  
  constructor() { }

}
