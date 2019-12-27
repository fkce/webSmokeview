import { Injectable } from '@angular/core';
import { HelpersService } from '../helpers/helpers.service';
import { EventsService } from '../events/events.service';

@Injectable({
  providedIn: 'root'
})
export class GlService {

  // Main webgl object
  gl: WebGLRenderingContext;
  ext_32bit = null;
  texture_colorbar = null;

  canvasHeight = null;
  canvasWidth = null;

  proj_matrix = null;
  projection_angle = 10.0;

  mo_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  normal_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  THETA: number = 0;
  PHI: number = 0;
  dKEYx: number = 0;
  dKEYy: number = 0;
  dKEYz: number = 0;

  xcen = 0.5;
  ycen = 0.5;
  zcen = 0.5;

  // PL: tutaj ustawiamy colorbar ...
  // colorbar
  texture_colorbar_data = new Uint8Array([
    0, 0, 0, 255,
    160, 80, 0, 255,
    80, 160, 0, 255,
    0, 255, 0, 255,
    255, 0, 0, 255,
    255, 0, 80, 255,
    255, 0, 160, 255,
    0, 0, 0, 255
  ]);
  texture_colorbar_numcolors = 8;
  
  constructor(
    public helpersService: HelpersService,
    public eventsService: EventsService,
  ) {
    this.eventsService.THETA$.asObservable().subscribe(THETA => { this.THETA = THETA; });
    this.eventsService.PHI$.asObservable().subscribe(PHI => { this.PHI = PHI; });
    this.eventsService.dKEYx$.asObservable().subscribe(dKEYx => { this.dKEYx = dKEYx; });
    this.eventsService.dKEYy$.asObservable().subscribe(dKEYy => { this.dKEYy = dKEYy; });
    this.eventsService.dKEYz$.asObservable().subscribe(dKEYz => { this.dKEYz = dKEYz; });
   }

  public init() {
    this.proj_matrix = this.helpersService.getProjection(this.projection_angle, this.canvasWidth / this.canvasHeight, 1, 100);
    this.view_matrix[14] -= 7.0;

    // Do depth test
    this.gl.enable(this.gl.DEPTH_TEST);
  }
  
  public draw() {

    //set model matrix to the identity
    this.mo_matrix[0] = 1, this.mo_matrix[1] = 0, this.mo_matrix[2] = 0, this.mo_matrix[3] = 0,
      this.mo_matrix[4] = 0, this.mo_matrix[5] = 1, this.mo_matrix[6] = 0, this.mo_matrix[7] = 0,
      this.mo_matrix[8] = 0, this.mo_matrix[9] = 0, this.mo_matrix[10] = 1, this.mo_matrix[11] = 0,
      this.mo_matrix[12] = 0, this.mo_matrix[13] = 0, this.mo_matrix[14] = 0, this.mo_matrix[15] = 1;

    // rotate 90 deg to be consistent with this.smokeview
    this.mo_matrix = this.helpersService.rotateX(this.mo_matrix, -1.57078);

    // scale scene by 1/2 if in VR mode
    //if (port != 0) {
    //  this.mo_matrix = this.helpersService.scaleZ(this.mo_matrix, 0.5);
    //}

    // scale and translate to be consistent with smokeview
    var scale = 1.5;
    var min_xz = 2.0 * Math.min(this.xcen, this.zcen);
    this.mo_matrix = this.helpersService.translateXYZ(this.mo_matrix, -scale * this.xcen / min_xz, -scale * this.ycen, -scale * this.zcen / min_xz);
    this.mo_matrix = this.helpersService.scaleAll(this.mo_matrix, scale / min_xz);

    // translate
    this.mo_matrix = this.helpersService.translateXYZ(this.mo_matrix, this.dKEYx, this.dKEYy, this.dKEYz);

    // rotate (translate to origin first)
    this.mo_matrix = this.helpersService.translateXYZ(this.mo_matrix, this.xcen, this.ycen, this.zcen);
    this.mo_matrix = this.helpersService.rotateX(this.mo_matrix, this.PHI);
    this.mo_matrix = this.helpersService.rotateZ(this.mo_matrix, this.THETA);
    this.mo_matrix = this.helpersService.translateXYZ(this.mo_matrix, -this.xcen, -this.ycen, -this.zcen);

    this.normal_matrix = this.helpersService.mat_inverse(this.mo_matrix);
    this.normal_matrix = this.helpersService.mat_transpose(this.normal_matrix);
  }
  
  public setupColorBar() {
    this.texture_colorbar = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture_colorbar);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, this.texture_colorbar_numcolors, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.texture_colorbar_data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }

}
