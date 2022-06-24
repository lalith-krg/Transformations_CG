export const vertexShaderSrc = `      
	attribute vec3 aPosition;
	uniform mat4 view_mat;
	uniform mat4 projection_mat;
	uniform mat4 uModelTransformMatrix;  
	void main () {             
		gl_Position = projection_mat * view_mat * uModelTransformMatrix * vec4(aPosition, 1.0); 
	}                          
`;