import { colorbars as Colorbars } from '../../consts/colorbars';
import * as BABYLON from 'babylonjs';

export class Slice {

    // Color index for each vertex
    tex: Float32Array;
    texData: Float32Array;

    mesh: BABYLON.Mesh;
    material: BABYLON.ShaderMaterial;

    /**
     * Create Slice class
     * @param vertices 
     * @param indices 
     * @param blank 
     * @param texData 
     * @param scene 
     * @param frameSize 
     */
    constructor(
        vertices: Float32Array,
        indices: Int32Array,
        blank: Float32Array,
        texData: Float32Array,
        scene: BABYLON.Scene,
        frameSize: number
    ) {

        // Create new custom mesh and vertex data
        this.mesh = new BABYLON.Mesh("custom", scene);
        var vertexData = new BABYLON.VertexData();
        this.texData = texData;

        // Compute normals
        var normals = new Float32Array();
        BABYLON.VertexData.ComputeNormals(vertices, indices, normals);

        // Assign data
        vertexData.positions = vertices;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(this.mesh, true);

        // Add colors to vertices
        this.tex = this.texData.slice(0, frameSize);
        this.mesh.setVerticesData('texture_coordinate', this.tex, true, 1);

        // Add colors to vertices
        this.mesh.setVerticesData('blank', blank, true, 1);

        // Create material with shaders
        this.material = new BABYLON.ShaderMaterial('shader', scene, '/assets/slice',
            {
                attributes: ['position', 'color', 'normal', 'texture_coordinate', 'blank'],
                uniforms: ['world', 'worldView', 'worldViewProjection', 'view', 'projection']
            });

        this.material.setInt('is_blank', 1);
        this.material.backFaceCulling = false;
        this.material.zOffset = 0.2;

        // Create RawTexture to sample the colors in fragment shaders
        let texture_colorbar = new BABYLON.RawTexture(Colorbars.rainbow.colors, 1, Colorbars.rainbow.number, BABYLON.Engine.TEXTUREFORMAT_RGBA, scene, false, false, BABYLON.Texture.LINEAR_LINEAR, BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE);

        texture_colorbar.wrapR = BABYLON.Texture.CLAMP_ADDRESSMODE;
        texture_colorbar.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;

        this.material.setTexture('texture_colorbar_sampler', texture_colorbar);
        this.mesh.material = this.material;
    }
}