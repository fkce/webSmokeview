import { Injectable, isDevMode } from '@angular/core';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { GlService } from '../gl/gl.service';

@Injectable({
  providedIn: 'root'
})
export class ObstService {

  buffer_vertices_lit = null;
  buffer_colors_lit = null;
  buffer_normals_lit = null;
  buffer_indices_lit = null;

  vertices_lit = [
    0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.5, 0.0, // bottom
    0.0, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, 0.5, 0.5, // top
    0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.5, // left
    0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, 0.5, // right
    0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.0, // back
    0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, // front
  ];

  normals_lit = [
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // bottom
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // top
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // right
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // back
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0  // front
  ];

  //if (this.ext_32bit == null) {
  //	var colors_obst_lit = [
  //		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  //		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //		1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  //		1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  //		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  //		0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  //	];
  //}
  //else {
  colors_lit = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
  ];
  //}

  indices_lit = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];

  // define file frame number and sizes

  // colorbar

  texture_colorbar_data = new Uint8Array([
    255, 0, 0, 255,
    160, 80, 0, 255,
    80, 160, 0, 255,
    0, 255, 0, 255,
    255, 0, 0, 255,
    255, 0, 80, 255,
    255, 0, 160, 255,
    0, 0, 255, 255
  ]);
  texture_colorbar_numcolors = 8;

  // line geometry

  constructor(
    private httpManager: HttpManagerService,
    private glS: GlService
  ) { }

  // setup blockage data
  setupObstData() {
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

  // exaple backend request
  public getObsts() {
    this.httpManager.get('https://localhost:3000/api/test').then(
      (result: Result) => {

        if (result.meta.status == 'success') {
          return result.data;
        }
      },
      (error) => {
        if (isDevMode()) console.log(error);
      });

  }

}
