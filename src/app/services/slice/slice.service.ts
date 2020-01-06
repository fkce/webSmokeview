import { Injectable, isDevMode } from '@angular/core';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { BabylonService } from '../babylon/babylon.service';
import * as BABYLON from 'babylonjs';
import { cloneDeep } from 'lodash';
import { environment } from '../../../environments/environment';
import { colorbars as Colorbars } from '../../consts/colorbars';

@Injectable({
  providedIn: 'root'
})
export class SliceService {

  vertices = [];
  indices = [];
  normals = [];

  // Color index for each vertex
  tex = new Float32Array([]);
  texData = new Float32Array([]);
  frameSize: number;
  frameNo: number = 0;
  frameCur: number = 0;

  mesh;
  vertexData;
  material;

  constructor(
    private httpManager: HttpManagerService,
    private babylonService: BabylonService
  ) { }

  /**
   * Render current obst geometry
   */
  public render() {

    if (!this.mesh) {
      // Create new custom mesh and vertex data
      this.mesh = new BABYLON.Mesh("custom", this.babylonService.scene);
      this.vertexData = new BABYLON.VertexData();
    }

    // Compute normals
    BABYLON.VertexData.ComputeNormals(this.vertices, this.indices, this.normals);

    // Assign data
    this.vertexData.positions = this.vertices;
    this.vertexData.indices = this.indices;
    this.vertexData.normals = this.normals;
    this.vertexData.applyToMesh(this.mesh, true);

    this.frameSize = this.vertices.length / 3;
    this.frameNo = this.texData.length / this.frameSize;
    this.tex = this.texData.slice(0, this.frameSize);

    // Add colors to vertices
    this.mesh.setVerticesData("texture_coordinate", this.tex, true, 1);

    var draw = [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 23
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Add colors to vertices
    this.mesh.setVerticesData("draw", draw, true, 1);


    // Create material with shaders
    if (!this.material) {
      this.material = new BABYLON.ShaderMaterial("shader", this.babylonService.scene, '/assets/slice',
        {
          attributes: ["position", "color", "normal", "texture_coordinate", "draw"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
      this.material.backFaceCulling = false;
      this.material.useLogarithmicDepth = true;
      this.material.zOffset = 0.2;

      // Create RawTexture to sample the colors in fragment shaders
      let texture_colorbar = new BABYLON.RawTexture(Colorbars.rainbow.colors, 1, Colorbars.rainbow.number, BABYLON.Engine.TEXTUREFORMAT_RGBA, this.babylonService.scene, false, false, BABYLON.Texture.LINEAR_LINEAR, BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE);
      texture_colorbar.wrapR = BABYLON.Texture.CLAMP_ADDRESSMODE;
      texture_colorbar.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;

      this.material.setTexture('texture_colorbar_sampler', texture_colorbar);

      this.mesh.material = this.material;

      this.frameCur = 0;
      setInterval(() => {
        if (this.frameCur == this.frameNo - 1) this.frameCur = 0;

        this.tex = this.texData.slice(this.frameCur * this.frameSize, (this.frameCur + 1) * this.frameSize);
        this.mesh.setVerticesData("texture_coordinate", this.tex, true, 1);
        this.frameCur++;

      }, 50);
    }
  }

  /**
   * Get default slice from server
   */
  public getFromServer() {

    this.httpManager.get(environment.host + '/api/slices').then(
      (result: Result) => {

        if (result.meta.status == 'success') {
          // Asigning variables
          this.vertices = result.data.vertices;
          this.indices = result.data.indices;
          this.texData = result.data.texData;

          this.render();
        }
      });
  }

  /**
   * Get obsts from json file
   * @param json Object with vertices, colors, indices, normals
   */
  public getFromFile(json: any) {

    this.vertices = json.vertices;
    this.indices = json.indices;
    this.texData = new Float32Array(json.texData);

    this.render();
  }

}
