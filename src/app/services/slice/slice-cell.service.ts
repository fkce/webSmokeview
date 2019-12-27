import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';
import { shaders as Shaders } from '../../consts/shaders';

@Injectable({
  providedIn: 'root'
})
export class SliceCellService {

  buffer_vertices_cell = null;
  buffer_textures_cell = null;
  buffer_indices_cell = null;

  show_cell: boolean = false;

  frame_size_cell = 24;

  cell_file_ready: boolean = true;

  vertShader_slice_cell = null;
  fragShader_slice_cell = null;
  shaderprogram_slice_cell = null;

  _Pmatrix_slice_cell = null;
  _Vmatrix_slice_cell = null;
  _Mmatrix_slice_cell = null;

  //----------------------------------------------------------------------------------------------------------------------------------------
  // slice cell file triangles
  vertices_cell = [
    0.1, 0.1, 0.5, 0.4, 0.1, 0.5, 0.4, 0.4, 0.5, 0.1, 0.4, 0.5,
    0.1, 0.1, 1.0, 0.4, 0.1, 1.0, 0.4, 0.4, 1.0, 0.1, 0.4, 1.0,
    0.1, 0.1, 0.5, 0.1, 0.4, 0.5, 0.1, 0.4, 1.0, 0.1, 0.1, 1.0,
    0.4, 0.1, 0.5, 0.4, 0.4, 0.5, 0.4, 0.4, 1.0, 0.4, 0.1, 1.0,
    0.1, 0.1, 0.5, 0.1, 0.1, 1.0, 0.4, 0.1, 1.0, 0.4, 0.1, 0.5,
    0.1, 0.4, 0.5, 0.1, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 0.5
  ];

  textures_cell_data = new Uint8Array([
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

  textures_cell = new Float32Array([
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0
  ]);

  indices_cell = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];

  constructor(
    private glS: GlService
  ) { }


  // setup slice cell file data
  setupData() {

    if (this.cell_file_ready) {
      this.buffer_vertices_cell = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_cell);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_cell), this.glS.gl.STATIC_DRAW);

      this.buffer_textures_cell = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_cell);
      this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_cell), this.glS.gl.STATIC_DRAW);

      this.buffer_indices_cell = this.glS.gl.createBuffer();
      this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_cell);
      if (this.glS.ext_32bit == null) {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_cell), this.glS.gl.STATIC_DRAW);
      }
      else {
        this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_cell), this.glS.gl.STATIC_DRAW);
      }
    }
  }

  public draw(iframe) {

    this.glS.gl.useProgram(this.shaderprogram_slice_cell);
    this.glS.gl.uniformMatrix4fv(this._Pmatrix_slice_cell, false, this.glS.proj_matrix);
    this.glS.gl.uniformMatrix4fv(this._Vmatrix_slice_cell, false, this.glS.view_matrix);
    this.glS.gl.uniformMatrix4fv(this._Mmatrix_slice_cell, false, this.glS.mo_matrix);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_cell);
    var _position_slice_cell = this.glS.gl.getAttribLocation(this.shaderprogram_slice_cell, "position");
    this.glS.gl.vertexAttribPointer(_position_slice_cell, 3, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_position_slice_cell);

    this.get_slice_cell_frame(iframe);

    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_textures_cell);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.textures_cell), this.glS.gl.STATIC_DRAW);
    var _texture_coordinate_slice_cell = this.glS.gl.getAttribLocation(this.shaderprogram_slice_cell, "texture_coordinate");
    this.glS.gl.vertexAttribPointer(_texture_coordinate_slice_cell, 1, this.glS.gl.FLOAT, false, 0, 0);
    this.glS.gl.enableVertexAttribArray(_texture_coordinate_slice_cell);

    this.glS.gl.activeTexture(this.glS.gl.TEXTURE0);
    this.glS.gl.bindTexture(this.glS.gl.TEXTURE_2D, this.glS.texture_colorbar);
    var texture_location = this.glS.gl.getUniformLocation(this.shaderprogram_slice_cell, "texture_colorbar_sampler");
    this.glS.gl.uniform1i(texture_location, 0);

    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_cell);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_cell.length, this.glS.gl.UNSIGNED_SHORT, 0);
    }
    else {
      this.glS.gl.drawElements(this.glS.gl.TRIANGLES, this.indices_cell.length, this.glS.gl.UNSIGNED_INT, 0);
    }
  }

  private get_slice_cell_frame(frame) {
    var i;

    for (i = 0; i < this.frame_size_cell; i++) {
      if (this.cell_file_ready) {
        this.textures_cell[i] = this.textures_cell_data[this.frame_size_cell * frame + i] / 255.0;
      }
      else {
        this.textures_cell[i] = 128 / 255.0;
      }
    }
  }

  public createShaders() {

    this.vertShader_slice_cell = this.glS.gl.createShader(this.glS.gl.VERTEX_SHADER);
    this.glS.gl.shaderSource(this.vertShader_slice_cell, Shaders.vertCode_slice_cell);
    this.glS.gl.compileShader(this.vertShader_slice_cell);

    this.fragShader_slice_cell = this.glS.gl.createShader(this.glS.gl.FRAGMENT_SHADER);
    this.glS.gl.shaderSource(this.fragShader_slice_cell, Shaders.fragCode_slice_cell);
    this.glS.gl.compileShader(this.fragShader_slice_cell);

    this.shaderprogram_slice_cell = this.glS.gl.createProgram();
    this.glS.gl.attachShader(this.shaderprogram_slice_cell, this.vertShader_slice_cell);
    this.glS.gl.attachShader(this.shaderprogram_slice_cell, this.fragShader_slice_cell);
    this.glS.gl.linkProgram(this.shaderprogram_slice_cell);

    this._Pmatrix_slice_cell = this.glS.gl.getUniformLocation(this.shaderprogram_slice_cell, "Pmatrix");
    this._Vmatrix_slice_cell = this.glS.gl.getUniformLocation(this.shaderprogram_slice_cell, "Vmatrix");
    this._Mmatrix_slice_cell = this.glS.gl.getUniformLocation(this.shaderprogram_slice_cell, "Mmatrix");

  }

}
