import vertShaderSrc from './simple.vert.js';
import fragShaderSrc from './simple.frag.js';

import Shader from './shader.js';

export default class Mesh {
    constructor(delta){
        //important coordinates
        //Coords = vertex coordinates
        //Colors = vertex colors
        //Indices = faces indexes in the coords array
        //Normals = vertex normals
        this.coords = [];
        this.colors = [];
        this.indices = [];
        this.normals = [];

        //model matrix
        this.angle = 0;
        this.delta = delta;
        this.model = mat4.create();
        this.modelView = mat4.create();

        //adressing shaders
        this.vertShd = null;
        this.fragShd = null;
        this.program = null;
    
        //data location
        this.vaoLoc = -1;
        this.uModelViewLoc = -1;
        this.indicesLoc = -1;
    }

    async loadModel(model) {
        const resp = await fetch(model);
        const text = await resp.text();

        const txtList = text.split(/\s+/);
        const data = txtList.map(d => +d);

        const nvertices = data[0];
        const nfaces = data[1];

        for(let i = 2; i < 5 * nvertices; i = i + 5){
            this.coords.push(data[i+0]);
            this.coords.push(data[i+1]);
            this.coords.push(data[i+2]);
        }

        for(let i = 5 * nvertices + 2; i < (4 * nfaces) + (5 * nvertices + 2); i = i + 4){
            this.indices.push(data[i+1]);
            this.indices.push(data[i+2]);
            this.indices.push(data[i+3]);
        }

        const cor = [1.0, 1.0, 1.0, 1.0];

        for(let i = 0; i < data.length; i++){
            this.colors.push(...cor);
        }

        this.normals = new Array(this.coords.length).fill(0);

        for (let fId = 0; fId < this.indices.length; fId += 3) {
            const v0Id = this.indices[fId + 0];
            const v1Id = this.indices[fId + 1];
            const v2Id = this.indices[fId + 2];

            const v0 = this.coords.slice(3 * v0Id, 3 * v0Id + 3);
            const v1 = this.coords.slice(3 * v1Id, 3 * v1Id + 3);
            const v2 = this.coords.slice(3 * v2Id, 3 * v2Id + 3);

            const vec1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]]; // v1-v0
            const vec2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]]; // v2-v0

            const n = [
            vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
            ];

            this.normals[3 * v0Id + 0] += n[0];
            this.normals[3 * v0Id + 1] += n[1];
            this.normals[3 * v0Id + 2] += n[2];

            this.normals[3 * v1Id + 0] += n[0];
            this.normals[3 * v1Id + 1] += n[1];
            this.normals[3 * v1Id + 2] += n[2];

            this.normals[3 * v2Id + 0] += n[0];
            this.normals[3 * v2Id + 1] += n[1];
            this.normals[3 * v2Id + 2] += n[2];
        }
    }

    createShaderProgram(gl) {
        this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
        this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
        this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);
    
        gl.useProgram(this.program);
    }

    createUniforms(gl) {
        this.uModelViewLoc = gl.getUniformLocation(this.program, "u_modelView");
    }

    async createVAO(gl) {
        await this.loadModel('bun_zipper.ply');
    
        var coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
        const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.coords));
        
        var colorsAttributeLocation = gl.getAttribLocation(this.program, "color");
        const colorsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.colors));
        
        var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
        const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(this.normals));
        
        this.vaoLoc = Shader.createVAO(gl, coordsAttributeLocation, coordsBuffer, colorsAttributeLocation, colorsBuffer, normalsAttributeLocation, normalsBuffer);
        this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices));
    }

    async init(gl) {
        this.createShaderProgram(gl);
        await this.createVAO(gl);
        this.createUniforms(gl);
    }

    modelMatrix() {
        const angle_x = document.querySelector("#angulox").value;
        const angle_y = document.querySelector("#anguloy").value;
        const angle_z = document.querySelector("#anguloz").value;

        mat4.identity( this.model );

        mat4.rotateX(this.model, this.model, -angle_x);
        mat4.rotateY(this.model, this.model, angle_y);
        mat4.rotateZ(this.model, this.model, -angle_z);
        // [ cos(this.angle) 0 -sin(this.angle) 0, 
        //         0         1        0         0, 
        //   sin(this.angle) 0  cos(this.angle) 0, 
        //         0         0        0         1]
        // * this.mat 

        mat4.translate(this.model, this.model, [0.0, -0.2, 0.0]);
        // [1 0 0 -0.5, 0 1 0 -0.5, 0 0 1 -0.5, 0 0 0 1] * this.mat 

        mat4.scale(this.model, this.model, [3.0, 3.0, 3.0]);
        // [10 0 0 0, 0 10 0 0, 0 0 10 0, 0 0 0 1] * this.mat 
    }
    
    draw(gl, cam) {
        // faces orientadas no sentido anti-horário
        gl.frontFace(gl.CW);
    
        // face culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vaoLoc);
        
        this.modelMatrix();
        cam.updateViewMatrix();
    
        mat4.identity(this.modelView);
        mat4.mul(this.modelView, cam.getView(), this.model);
    
        gl.uniformMatrix4fv(this.uModelViewLoc, false, this.modelView);
    
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
    
        gl.disable(gl.CULL_FACE);
    }
}