import { Injectable } from '@angular/core';
import { GlService } from '../gl/gl.service';

@Injectable({
  providedIn: 'root'
})
export class GeomService {

  buffer_vertices_lit = null;
  buffer_normals_lit = null;
  buffer_colors_lit = null;
  buffer_indices_lit = null;

  // geometry
  vertices_lit = [
    0.0, 0.6, 0.0, 0.5, 0.6, 0.0, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, // bottom
    0.0, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5, 1.0, 0.5, 0.0, 1.0, 0.5, // top
    0.0, 0.6, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.0, 0.6, 0.5, // left
    0.5, 0.6, 0.0, 0.5, 1.0, 0.0, 0.5, 1.0, 0.5, 0.5, 0.6, 0.5, // right
    0.0, 0.6, 0.0, 0.0, 0.6, 0.5, 0.5, 0.6, 0.5, 0.5, 0.6, 0.0, // back
    0.0, 1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.0, // front
  ];

  normals_lit = [
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // bottom
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // top
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // right
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // back
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0  // front
  ];

  // if (this.ext_32bit == null) {
  //   colors_geom_lit = [
  //     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //     1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  //     1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  //     1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  //     0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  //   ];
  // }
  // else {
  colors_lit = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  ];

  indices_lit = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];

  constructor(
    private glS: GlService
  ) { }

  // setup geom data
  public setupGeomData() {

    this.buffer_vertices_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_vertices_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.vertices_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_normals_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_normals_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.normals_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_colors_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ARRAY_BUFFER, this.buffer_colors_lit);
    this.glS.gl.bufferData(this.glS.gl.ARRAY_BUFFER, new Float32Array(this.colors_lit), this.glS.gl.STATIC_DRAW);

    this.buffer_indices_lit = this.glS.gl.createBuffer();
    this.glS.gl.bindBuffer(this.glS.gl.ELEMENT_ARRAY_BUFFER, this.buffer_indices_lit);
    if (this.glS.ext_32bit == null) {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices_lit), this.glS.gl.STATIC_DRAW);
    }
    else {
      this.glS.gl.bufferData(this.glS.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices_lit), this.glS.gl.STATIC_DRAW);
    }
  }

}
