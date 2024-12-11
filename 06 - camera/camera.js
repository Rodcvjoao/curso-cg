export default class Camera {
    constructor(gl){
        this.eye = vec3.fromValues(0.0, 0.0, 0.5);
        this.at  = vec3.fromValues(0.0, 0.0, 0.0);
        this.up  = vec3.fromValues(0.0, 1.0, 0.0);
        
        this.fovy = Math.PI / 2;
        this.aspect = gl.canvas.width / gl.canvas.height;

        this.left = -2.5;
        this.right = 2.5;
        this.top = 2.5;
        this.bottom = -2.5;

        this.near = 0;
        this.far = 5;

        this.view = mat4.create();  
        this.proj = mat4.create();
    }

    getView(){
        return this.view;
    }

    getProj(){
        return this.proj;
    }

    updateProjectionMatrix(type = ''){
        mat4.identity(this.proj);

        if(type === 'ortho'){
            mat4.ortho(this.proj, this.left * this.aspect, this.right * this.aspect, this.bottom, this.top, this.near, this.far);
        } 
        else{
            mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);
        }
    }

    updateViewMatrix(){
        mat4.identity(this.view);
        mat4.lookAt(this.view, this.eye, this.at, this.up);
    }

    updateCam(){
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }
}