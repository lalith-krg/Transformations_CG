import { Transform } from "./transform.js";

export class Obj {
    constructor(obj_data, colour){
        this.vertexPositions = new Float32Array(obj_data.position);
        this.transform = new Transform();
        this.colour = colour;
        this.center = [0,0,0];
    }
}
