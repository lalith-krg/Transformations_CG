# Transformations in WebGL

## How to execute

For this, you need to serve the static files using any server. eg.

1. If you are using VS Code, you can use the 'live server' plugin. [https://www.freecodecamp.org/news/vscode-live-server-auto-refresh-browser/]

2. If you have Python installed locally : 

	1. If Python version 3.X is available :
	`python3 -m http.server`

	2. If Python version 2.X is available :
	`python -m SimpleHTTPServer`

3. If you have a node setup, you can do :
	1. `npm install --global http-server` 
	
	2. `http-server`


To use this application, you switch between 2 modes by pressing the key `m`.

### Mode 1

You are in the top view/sky view mode. You are viewing the scene from the top of the z-axis. This mode allows you to transform the objects individually. First select a piece by clicking on it. To rotate, scale or translate, use the GUI dragging bars.

You can also animate in this mode. To enter animation mode, press the `a` key. Then select two points to create a path and move the object by it. To start animation, click on `a` again.

As you are already in animation mode, you can repeat the procedure by selecting the object and points again. You can increase the speed of animation by pressing `i` key and lower the speed by pressing `l` key.

You can still rotate or scale the objects while in animation. To stop animation mode press `s`.

### Mode 2

You view the scene from the camera view. You get the 3D perception in this mode. In this mode, you can rotate the camera about the y-axis of the scene by pressing the left mouse button and dragging in the x-axis of the canvas.

You can also switch the mode while animating to see the animation in this mode.

You can also zoom into the scene by pressing `+` or `=` key and you can zoom out of the scene by pressing `-` or `_` in this mode. This also applicable in mode 1.

