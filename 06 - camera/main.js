import Mesh from './mesh.js';
import Camera from './camera.js';
import Light from './light.js';

class Scene {
  constructor(gl) {
    this.camera = new Camera(gl);

    this.light = new Light();

    this.mesh = new Mesh(0.0);
  }

  async init(gl){
    await this.mesh.init(gl, this.light);
  }

  draw(gl){
    this.camera.updateCam();
    this.light.updateLight();
    this.mesh.draw(gl, this.camera);
  }

  viewMatrix() {
    mat4.identity( this.view );

    this.eye = vec3.fromValues(0.0, 0.0, 0.0);
  
    mat4.lookAt(this.view, this.eye, this.at, this.up);
    // TODO: Tentar implementar as contas diretamente
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");
    this.gl = canvas.getContext("webgl2");
    
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.scene = new Scene(this.gl);
  }

  async init(){
    await this.scene.init(this.gl);
    this.draw();
  }

  draw() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

window.onload = () => {
  const app = new Main();
  app.init();
}