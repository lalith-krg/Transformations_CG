import { Scene, Cube, WebGLRenderer, Shader } from './lib/threeD.js';
import {vertexShaderSrc} from './shaders/vertex.js';
import {fragmentShaderSrc} from './shaders/fragment.js';
import * as dat from 'https://cdn.skypack.dev/dat.gui';
import {vec3, vec4, mat4} from 'https://cdn.skypack.dev/gl-matrix';
import {LoadObject} from './lib/loadObject.js';
import {Obj} from './lib/obj.js';

const scene = new Scene();

var mode = 0;
var eye=[], target=[], up=[];
var view_mat, projection_mat;
var selectedObject = -1;
var animateOn = 0;
var animatePoints = [];
var step = 0;
var animationTrigger = 0;
var animationSpeed = 1;

var transformMatrix = mat4.create();
mat4.identity(transformMatrix);

// Z-axis view

eye = [0, 0, 25];
target = [0, 0, 0];
up = [0, 1, 0];

// Load objects

let path_x = './x_axis.obj';
let obj_loader_x = new LoadObject(path_x);
const x_axis_pos = await(obj_loader_x.getObjectData());

let path_y = './y_axis.obj';
let obj_loader_y = new LoadObject(path_y);
const y_axis_pos = await(obj_loader_y.getObjectData());

let path_z = './z_axis.obj';
let obj_loader_z = new LoadObject(path_z);
const z_axis_pos = await(obj_loader_z.getObjectData());

let path_sph = './sphere.obj'
let obj_loader_sph = new LoadObject(path_sph);
const sphere_pos = await(obj_loader_sph.getObjectData());

let path_god_knows = './all_ops.obj'
let obj_loader_gk = new LoadObject(path_god_knows);
const gk_pos = await(obj_loader_gk.getObjectData());



const x_axis = new Obj(x_axis_pos, [1, 0, 0, 1]);

const y_axis = new Obj(y_axis_pos, [0, 1, 0, 1]);
y_axis.transform.rotationAngleX = Math.PI/2;

const z_axis = new Obj(z_axis_pos, [0, 0, 1, 1]);
z_axis.transform.rotationAngleX = Math.PI/2;

const sphere = new Obj(sphere_pos, [1, 1, 0, 1]);

scene.add(x_axis);
scene.add(y_axis);
scene.add(z_axis);
scene.add(sphere);

// final objects are not movable
let finals = [x_axis, y_axis, z_axis, sphere];


// object with all operations performed
const gk = new Obj(gk_pos, [0, 1, 1, 1]);
gk.transform.scale = [1.5, 1.5, 1.5];
scene.add(gk);

const cube = new Cube(0, 0, [1, 0, 1, 1]);
cube.transform.scale = [1.5,1.5,1.5];
scene.add(cube);

// primitive objects which are movable
let prims = [cube, gk];
let colours = [[1, 0, 1, 1], [0, 1, 1, 1]];


const renderer = new WebGLRenderer();
renderer.setSize(600, 600);
document.body.appendChild( renderer.domElement );

const shader = new Shader(renderer.glContext(), vertexShaderSrc, fragmentShaderSrc);
shader.use();

const gui = new dat.GUI();


// List of transform parameters of movable objects

const transformSettings = {
	translateX: 0.0,
	translateY: 0.0,
	translateZ: 0.0,
	rotationAngleX: 0.0,
	rotationAngleY: 0.0,
	rotationAngleZ: 0.0,
	scale: 1.0
};


// GUI controls

gui.add(transformSettings, 'translateX', -10.0, 10.0).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.translate = [transformSettings.translateX,selectedObject.transform.translate[1], selectedObject.transform.translate[2]];
		selectedObject.center = [transformSettings.translateX, selectedObject.center[1], selectedObject.center[2]];
	}
});

gui.add(transformSettings, 'translateY', -10.0, 10.0).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.translate = [selectedObject.transform.translate[0],transformSettings.translateY, selectedObject.transform.translate[2]];
		selectedObject.center = [selectedObject.center[0], transformSettings.translateY, selectedObject.center[2]];
	}
});

gui.add(transformSettings, 'translateZ', -10.0, 10.0).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.translate = [selectedObject.transform.translate[0], selectedObject.transform.translate[1],transformSettings.translateZ];
		selectedObject.center = [selectedObject.center[0], selectedObject.center[1], transformSettings.translateZ];
	}
});

gui.add(transformSettings, 'rotationAngleX', -Math.PI, Math.PI).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.rotationAngleX = transformSettings.rotationAngleX;
	}
});

gui.add(transformSettings, 'rotationAngleY', -Math.PI, Math.PI).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.rotationAngleY = transformSettings.rotationAngleY;
	}
});

gui.add(transformSettings, 'rotationAngleZ', -Math.PI, Math.PI).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		selectedObject.transform.rotationAngleZ = transformSettings.rotationAngleZ;
	}
});

gui.add(transformSettings, 'scale', 0, 10).step(0.01).onChange(function ()
{
	if (mode == 0 && selectedObject!=-1){
		let ts = transformSettings.scale;
		selectedObject.transform.scale = [ts, ts, ts];
	}
});




// function to reset colour after picking and leaving objects
function setOriginalColour(){
	for(let i=0; i<prims.length; i++){
		prims[i].colour = colours[i];
	}
}

// to calculate view and projection matrices
function calc_vec(){
	view_mat = mat4.create();
	view_mat = mat4.lookAt(view_mat, eye, target, up);
	view_mat = mat4.multiply(view_mat,view_mat,transformMatrix);

	projection_mat = mat4.create();
	projection_mat = mat4.perspective(projection_mat, Math.PI/4, 1, 1, 1000);
}

function centroid(prim){
	return prim.center;
}

function getPoint(event){
	// transforming canvas coordinates
	let rect = event.target.getBoundingClientRect();
	let x = ((event.clientX - rect.left)/(rect.right-rect.left) - 0.5)*2;
	let y = -((event.clientY - rect.top)/(rect.bottom-rect.top) - 0.5)*2;

	let inv_mat = mat4.create();
	mat4.multiply(inv_mat, projection_mat, view_mat);
	mat4.invert(inv_mat, inv_mat);

	let trans_point = vec3.fromValues(x, y, 0.9);

	let res = vec3.create();
	vec3.transformMat4(res, trans_point, inv_mat);

	// console.log(x, y);
	return res;
}

var lastMouseX = 0;
var lastMouseY = 0;
var leftPress = false;
var dAngleY = 0;

var camAngleY = 0;
// when mouse is clicked
function getMousePosition(canvas, event){

	// transforming canvas coordinates
	// let rect = canvas.getBoundingClientRect();
	// let x = ((event.clientX - rect.left)/(rect.right-rect.left) - 0.5)*2;
	// let y = -((event.clientY - rect.top)/(rect.bottom-rect.top) - 0.5)*2;
	
	const rect = canvas.getBoundingClientRect();
	let mouseX = event.clientX - rect.left;
	let mouseY = event.clientY - rect.top;

	// console.log("Coordinate x: " + x, "Coordinate y: " + y);
	console.log("Coordinate x: " + mouseX, "Coordinate y: " + mouseY);

	const pixelX = mouseX * renderer.gl.canvas.width / renderer.gl.canvas.clientWidth;
	const pixelY = renderer.gl.canvas.height - mouseY * renderer.gl.canvas.height / renderer.gl.canvas.clientHeight - 1;

	const data = new Uint8Array(4);
	renderer.gl.readPixels(
		pixelX,            // x
		pixelY,            // y
		1,                 // width
		1,                 // height
		renderer.gl.RGBA,           // format
		renderer.gl.UNSIGNED_BYTE,  // type
		data);             // typed array to hold result
	
	// selecting nearest piece to clicked coordinates
	// var pixelValues = new Uint8Array(4);
	// shader.gl.readPixels(x, y, 1, 1, shader.gl.RGBA, shader.gl.UNSIGNED_BYTE, pixelValues);
	console.log(data);
	
	if(animateOn == 0 && mode == 0){
		// cube: pink
		if(data[0] === 255 && data[1] === 0 && data[2] === 255)
		{
			setOriginalColour();
			selectedObject = prims[0];
			selectedObject.colour = [0.2, 0.2, 0.2, 1];
			console.log("Selected cube");
		}
		// gk: light blue
		else if(data[0] === 0 && data[1] === 255  && data[2] === 255)
		{
			setOriginalColour();
			selectedObject = prims[1];
			selectedObject.colour = [0.2, 0.2, 0.2, 1];
			console.log("Selected gk");
		}
		else{
			setOriginalColour();
			selectedObject = -1;
		}
	}
		
	// animation mode
	if(animateOn == 1 && mode == 0){

		console.log("AnimateOn point");

		if (animatePoints.length == 0){
			// cube: pink
			if(data[0] === 255 && data[1] === 0 && data[2] === 255)
			{
				setOriginalColour();
				selectedObject = prims[0];
				selectedObject.colour = [0.2, 0.2, 0.2, 1];
				console.log("Selected cube");
				animatePoints[0] = (centroid(selectedObject));
			}
			// gk: light blue
			else if(data[0] === 0 && data[1] === 255  && data[2] === 255)
			{
				setOriginalColour();
				selectedObject = prims[1];
				selectedObject.colour = [0.2, 0.2, 0.2, 1];
				console.log("Selected gk");
				animatePoints[0] = (centroid(selectedObject));
			}
			else{
				setOriginalColour();
				selectedObject = -1;
			}
			console.log("0th", animatePoints, selectedObject);
		}

		// first and second points

		else if (animatePoints.length == 1){
			animatePoints[1] = getPoint(event);
			console.log("1st", animatePoints, selectedObject);
		}
		else if (animatePoints.length == 2){
			animatePoints[2] = getPoint(event);
			console.log("2nd", animatePoints, selectedObject);
		}

		else (console.log("Points already selected"));
	}

	leftPress = true;

	if(mode === 1)
	{
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
	}

	window.addEventListener("mouseup", (event) => {
		leftPress = false;
	})

	window.addEventListener("mouseout", (event) => {
		leftPress = false;
	})

	window.addEventListener("mousemove", (event) => {
		if(mode === 1 && leftPress === true){

			let currentX = event.clientX;
			let currentY = event.clientY;
			
			console.log(lastMouseX-currentX);

			let dAngleY = 0.0001 * (currentX - lastMouseX);

			camAngleY += dAngleY;

			mat4.rotate(transformMatrix, transformMatrix, camAngleY, [0, 1, 0]);
			calc_vec();

			lastMouseX = currentX;
			lastMouseY = currentY;
		}
	})


}
let canvasElem = document.querySelector("canvas");
canvasElem.addEventListener("mousedown", function(e){
	getMousePosition(canvasElem, e);
});


const objAnimation = function (){
	if(animationTrigger == 1 && animatePoints.length == 3){
		if(step <= 1){
			const a = [2*animatePoints[0][0] - 4*animatePoints[1][0] + 2*animatePoints[2][0], 2*animatePoints[0][1] - 4*animatePoints[1][1] + 2*animatePoints[2][1], 2*animatePoints[0][2] - 4*animatePoints[1][2] + 2*animatePoints[2][2]];
			const b = [-3*animatePoints[0][0] + 4*animatePoints[1][0] - animatePoints[2][0], -3*animatePoints[0][1] + 4*animatePoints[1][1] - animatePoints[2][1], -3*animatePoints[0][2] + 4*animatePoints[1][2] - animatePoints[2][2]];
			const c = new Float32Array(animatePoints[0]);

			selectedObject.transform.translate = 
			[a[0] * Math.pow(step,2) + b[0] * Math.pow(step,1) + c[0],
			 a[1] * Math.pow(step,2) + b[1] * Math.pow(step,1) + c[1],
			 a[2] * Math.pow(step,2) + b[2] * Math.pow(step,1) + c[2]];

			step += 0.005*animationSpeed;

			selectedObject.center = selectedObject.transform.translate;
		}
		else{
			animateOn == 0;
			animatePoints = [];
			animationTrigger = 0;
			setOriginalColour();
			selectedObject = -1;
			step = 0;
		}
	}
}

// Keyboard interaction
// m or M to change mode

document.addEventListener('keydown', (event) => {
	var name = event.key;
	var code = event.code;

	if (name == 'm' || name == 'M'){
		mode = 1-mode;

		console.log("Mode: " + mode);
		
		// standard z-axis view
		if (mode == 0){
			console.log("Z-axis view");
			// Z-axis view
			
			eye = [0, 0, 25];
			target = [0, 0, 0];
			up = [0, 1, 0];
		}

		// eye view
		else if (mode == 1){

			setOriginalColour();

			console.log("Eye view");
			// Eye view	

			eye = [20, 20, 20];
			target = [0, 0, 0];
			up = [0, 1, 0];
		}
	}

	else if(name == '+' || name == '='){
		if (mode == 0)
			eye = [eye[0], eye[1], eye[2]-0.1];
			
		if (mode == 1)
			eye = [eye[0]-0.1, eye[1]-0.1, eye[2]-0.1];
	}
	

	else if(name == '-' || name == '_'){
		if (mode == 0)
			eye = [eye[0], eye[1], eye[2]+0.1];
			
		if (mode == 1)
			eye = [eye[0]+0.1, eye[1]+0.1, eye[2]+0.1];
	}

	// animation toggle
	else if(name == 'a' || name == 'A'){
		if (animateOn == 0){
			animateOn = 1;
			setOriginalColour();
			selectedObject = -1;
		}
		else if (animateOn == 1){
			animationTrigger = 1;
		}
		
		console.log("Animate on: ", animateOn);
		
	}

	// stop animation
	else if(name == 's' || name == 'S'){
		animateOn = 0;
		animatePoints = [];
		animationTrigger = 0;
		setOriginalColour();
		selectedObject = -1;
	}

	// control animation speed
	else if(name == 'i' || name == 'I'){
		animationSpeed += 0.1;
	}
	// control animation speed
	else if(name == 'l' || name == 'L'){
		animationSpeed -= 0.1;

		if (animationSpeed <= 0){
			animationSpeed = 0.1;
		}
	}

	// calculate view and projection matrices
	calc_vec();

	// Alert the key name and key code on keydown
	console.log(`Key pressed ${name}`);
}, false);


calc_vec();

renderer.setAnimationLoop(animation);

//Draw loop
function animation()
{	
	renderer.clear(0.9,0.9,0.9,1);
	renderer.render(scene, shader);
	shader.setUniformMatrix4fv('view_mat', view_mat);
	shader.setUniformMatrix4fv('projection_mat', projection_mat);
	objAnimation();
}