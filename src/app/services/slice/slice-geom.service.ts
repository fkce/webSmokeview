import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { shaders as Shaders } from '../../consts/shaders';

@Injectable({
  providedIn: 'root'
})
export class SliceGeomService {

  buffer_vertices_geom = null;
  buffer_textures_geom = null;
  buffer_indices_geom = null;

  show_geom: boolean = false;

  frame_size_geom = 24;

  geom_file_ready: boolean = true;

  vertShader_slice_geom = null;
  fragShader_slice_geom = null;
  shaderprogram_slice_geom = null;

  _Pmatrix_slice_geom = null;
  _Vmatrix_slice_geom = null;
  _Mmatrix_slice_geom = null;



  // slice geom file triangles
  vertices_geom = [
    0.75, 0.125, 0.30, 1.00, 0.125, 0.30, 1.00, 0.375, 0.30, 0.75, 0.375, 0.30,
    0.75, 0.125, 0.65, 1.00, 0.125, 0.65, 1.00, 0.375, 0.65, 0.75, 0.375, 0.65,
    0.75, 0.125, 0.30, 0.75, 0.375, 0.30, 0.75, 0.375, 0.65, 0.75, 0.125, 0.65,
    1.00, 0.125, 0.30, 1.00, 0.375, 0.30, 1.00, 0.375, 0.65, 1.00, 0.125, 0.65,
    0.75, 0.125, 0.30, 0.75, 0.125, 0.65, 1.00, 0.125, 0.65, 1.00, 0.125, 0.30,
    0.75, 0.375, 0.30, 0.75, 0.375, 0.65, 1.00, 0.375, 0.65, 1.00, 0.375, 0.30
  ];

  textures_geom_data = new Uint8Array([
    0, 0, 0, 0,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,
    191, 191, 191, 191,
    191, 191, 191, 191,
    0, 0, 0, 0,
    38, 38, 38, 38,
    76, 76, 76, 76,
    115, 115, 115, 115,
    153, 153, 153, 153,
  ]);

  textures_geom = new Float32Array([
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
  ]);

  indices_geom = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];

  constructor(
    private glS: GlService
  ) { }


  // setup slice geom file data
  setupData() {

    if (this.geom_file_ready) {
      this.buffer_vertices_geom = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_geom);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_geom), this.glS.gl.STATIC_DRAW);

      this.buffer_textures_geom = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_geom);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_geom), this.glS.gl.STATIC_DRAW);

      this.buffer_indices_geom = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_geom);
      if (this.glS.ext_32bit == null) {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_geom), this.glS.gl.STATIC_DRAW);
      }
      else {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_geom), this.glS.gl.STATIC_DRAW);
      }
    }
  }

  public draw(iframe) {

    this.glS.gl.useProgram(this.shaderprogram_slice_geom);
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_slice_geom, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_slice_geom, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_slice_geom, false, this.glS.mo_matrix);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_geom);
    var _position_slice_geom = this.glS.gl.getAttribLocation(this.shaderprogram_slice_geom, "position");
    this.glS.gl.vertexAttribPointer(_position_slice_geom, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_slice_geom);

    this.get_slice_geom_frame(iframe);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_geom);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_geom), this.glS.gl.STATIC_DRAW);
    var _texture_coordinate_slice_geom = this.glS.gl.getAttribLocation(this.shaderprogram_slice_geom, "texture_coordinate");
    this.glS.gl.vertexAttribPointer(_texture_coordinate_slice_geom, 1, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_texture_coordinate_slice_geom);

    this.glS.gl.activeTexture(this.glS.gl.TEXTURE0);
    this.glS.gl.bindTexture(this.glS.gl.TEXTURE_2D, this.glS.texture_colorbar);
    var texture_location = this.glS.gl.getUniformLocation(this.shaderprogram_slice_geom, "texture_colorbar_sampler");
    this.glS.gl.uniform1i(texture_location, 0);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_geom);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_geom.length, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_geom.length, this.glS.gl.UNSIGNED_INT, 0);
    }
  }

  private get_slice_geom_frame(frame) {
    var i;

    for (i = 0; i < this.frame_size_geom; i++) {
      if (this.geom_file_ready) {
        this.textures_geom[i] = this.textures_geom_data[this.frame_size_geom * frame + i] / 255.0;
      }
      else {
        this.textures_geom[i] = 128 / 255.0;
      }
    }
  }

  public createShaders() {

    this.vertShader_slice_geom = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_slice_geom, Shaders.vertCode_slice_geom);
    this.glS.gl.compileShader(this.vertShader_slice_geom);

    this.fragShader_slice_geom = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_slice_geom, Shaders.fragCode_slice_geom);
    this.glS.gl.compileShader(this.fragShader_slice_geom);

    this.shaderprogram_slice_geom = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_slice_geom, this.vertShader_slice_geom);
    this.glS.gl.attachShader(this.shaderprogram_slice_geom, this.fragShader_slice_geom);
    this.glS.gl.linkProgram(this.shaderprogram_slice_geom);

    this._Pmatrix_slice_geom = this.glS.gl.getUniformLocation(this.shaderprogram_slice_geom, "Pmatrix");
    this._Vmatrix_slice_geom = this.glS.gl.getUniformLocation(this.shaderprogram_slice_geom, "Vmatrix");
    this._Mmatrix_slice_geom = this.glS.gl.getUniformLocation(this.shaderprogram_slice_geom, "Mmatrix");

  }


}
