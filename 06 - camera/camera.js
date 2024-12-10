export default class Camera {
    constructor(gl){
        this.eye = vec3.fromValues(0.0, 0.0, 0.0);
        this.at  = vec3.fromValues(0.0, 0.0, 0.0);
        this.up  = vec3.fromValues(1.0, 0.0, 0.0);
        
        this.view = mat4.create();  
    }

    getView(){
        return this.view;
    }

    updateViewMatrix(){
        mat4.identity(this.view);
        mat4.lookAt(this.view, this.eye, this.at, this.up);
    }

    updateCam(){
        this.updateViewMatrix();
    }
}