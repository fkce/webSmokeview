import { Injectable, isDevMode } from '@angular/core';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { BabylonService } from '../babylon/babylon.service';
import * as BABYLON from 'babylonjs';
import { cloneDeep, forEach, concat } from 'lodash';
import { environment } from '../../../environments/environment';
import { HelpersService } from '../helpers/helpers.service';

@Injectable({
  providedIn: 'root'
})
export class ObstService {

  vertices = [];
  normals = [];
  colors = [];
  indices = [];

  mesh;
  vertexData;
  material;

  clipX: number = 0.0;
  clipY: number = 0.0;
  clipZ: number = 100.0;

  constructor(
    private httpManager: HttpManagerService,
    private babylonService: BabylonService,
    private helperService: HelpersService
  ) { }


  public getTest(geometry: any) {

    //let geometry = [
    //  {
    //    xb: [0.0, 0.4, 0.0, 0.1, 0.0, 1.0],
    //    color: [1.0, 0.0, 0.0, 1.0]
    //  },
    //  {
    //    xb: [0.5, 0.8, 0.2, 0.3, 0.0, 0.5],
    //    color: [0.0, 1.0, 0.0, 1.0]
    //  },
    //  {
    //    xb: [0.0, 0.2, 0.6, 0.7, 0.0, 0.2],
    //    color: [0.0, 0.0, 1.0, 1.0]
    //  }
    //];

    forEach(geometry, (obst, index: number) => {
      this.vertices.push(...this.helperService.getVertices(obst.xb));
      this.colors.push(...this.helperService.getColors(obst.color));
      this.indices.push(...this.helperService.getIndices(index));
    });

    this.render();
    //this.zoomToCenter();
    //this.zoomToMesh();
  }

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

    // Add alpha = 1.0 every 3rd elemnet to color array
    //for (var itemIndex = 3; itemIndex < this.colors.length; itemIndex += 4) {
    //  this.colors.splice(itemIndex, 0, 1.0);
    //}
    //this.colors.push(1.0);

    // Assign data
    this.vertexData.positions = this.vertices;
    this.vertexData.indices = this.indices;
    this.vertexData.colors = this.colors;
    this.vertexData.normals = this.normals;
    this.vertexData.applyToMesh(this.mesh);

    // Create material with shaders
    if (!this.material) {
      this.material = new BABYLON.ShaderMaterial("shader", this.babylonService.scene, '/assets/obst',
        {
          attributes: ["position", "color", "normal"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });

      this.material.setFloat("clipX", -0.001);
      this.material.setFloat("clipY", -0.001);
      this.material.setFloat("clipZ", 1.001);

      this.mesh.material = this.material;
      this.mesh.enableEdgesRendering();
      this.mesh.edgesWidth = 0.1;
      this.mesh.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

      this.material.backFaceCulling = false;
      this.material.useLogarithmicDepth = true;

    }
  }

  /**
   * Clip mesh
   * @param value percentage
   * @param direction x, y, z direction
   */
  public clip(value: number, direction: string) {

    let boundingMax = this.mesh.getBoundingInfo().maximum;
    if (direction == 'x') {
      this.clipX = value;
      let clip = (value == 100) ? 1.1 : boundingMax.x * (value / 100);
      clip = (value == 0) ? -0.1 : clip;
      this.mesh.material.setFloat("clipX", clip);
    }
    else if (direction == 'y') {
      this.clipY = value;
      let clip = (value == 100) ? 1.1 : boundingMax.y * (value / 100);
      clip = (value == 0) ? -0.1 : clip;
      this.mesh.material.setFloat("clipY", clip);
    }
    else if (direction == 'z') {
      this.clipZ = value;
      let clip = (value == 100) ? 1.1 : boundingMax.z * (value / 100);
      clip = (value == 0) ? -0.1 : clip;
      this.mesh.material.setFloat("clipZ", clip);
    }
  }

  /**
   * Get default obsts from server
   */
  public getFromServer() {

    this.httpManager.get(environment.host + '/api/obsts').then(
      (result: Result) => {

        if (result.meta.status == 'success') {
          // Asigning variables
          this.vertices = result.data.vertices;
          this.colors = result.data.colors;
          this.indices = result.data.indices;

          this.render();
          this.zoomToCenter();
          this.zoomToMesh();
        }
      });
  }

  /**
   * Get obsts from json file
   * @param json Object with vertices, colors, indices, normals
   */
  public getFromFile(json: any) {

    this.vertices = json.vertices;
    this.colors = json.colors;
    this.indices = json.indices;

    this.render();
    this.zoomToCenter();
    this.zoomToMesh();
  }

  /**
   * Move camera to mesh center
   */
  public zoomToCenter() {

    // Set camera target to the center of obst mesh
    let bounding = cloneDeep(this.mesh.getBoundingInfo().boundingSphere);

    this.babylonService.camera.setTarget(bounding.centerWorld);
    this.babylonService.camera.setPosition(new BABYLON.Vector3(bounding.centerWorld.x, bounding.centerWorld.y - 2, bounding.centerWorld.z));
  }

  /**
   * Zoom to mesh
   */
  public zoomToMesh() {

    // Zoom in/out to mesh
    let radius = this.mesh.getBoundingInfo().boundingSphere.radiusWorld;
    let aspectRatio = this.babylonService.engine.getAspectRatio(this.babylonService.camera);
    let halfMinFov = this.babylonService.camera.fov / 2;
    if (aspectRatio < 1) {
      halfMinFov = Math.atan(aspectRatio * Math.tan(this.babylonService.camera.fov / 2));
    }
    let viewRadius = Math.abs(radius / Math.sin(halfMinFov));
    this.babylonService.camera.radius = viewRadius;
  }

}
