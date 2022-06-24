import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export class Transform
{
	constructor()
	{
		this.translate = vec3.create();
		vec3.set(this.translate, 0, 0, 0);
		
		this.scale = vec3.create();
		vec3.set(this.scale, 1, 1, 1);
		
		this.rotationAngleX = 0;
		this.rotationAngleY = 0;
		this.rotationAngleZ = 0;

		this.rotationAxisX = vec3.create();
		vec3.set(this.rotationAxisX, 1, 0, 0);
		
		this.rotationAxisY = vec3.create();
		vec3.set(this.rotationAxisY, 0, 1, 0);

		this.rotationAxisZ = vec3.create();
		vec3.set(this.rotationAxisZ, 0, 0, 1);	

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.updateModelTransformMatrix();
	}

	updateModelTransformMatrix()
	{
		mat4.identity(this.modelTransformMatrix);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);	
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleX, this.rotationAxisX);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleY, this.rotationAxisY);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngleZ, this.rotationAxisZ);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
	}	
}