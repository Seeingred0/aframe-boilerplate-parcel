
// three REVISION = '117';
/*  
* CopyShader 
* EffectComposer
* Pass 
* RenderPass 
* ShaderPass 
* OutlinePass 
* MaskPass
* ClearMaskPass
*/
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

 THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

		"vec4 texel = texture2D( tDiffuse, vUv );",
		"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function (renderer, renderTarget) {

	this.renderer = renderer;

	if (renderTarget === undefined) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getSize(new THREE.Vector2());
		this._pixelRatio = renderer.getPixelRatio();
		this._width = size.width;
		this._height = size.height;

		renderTarget = new THREE.WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
		renderTarget.texture.name = 'EffectComposer.rt1';

	} else {

		this._pixelRatio = 1;
		this._width = renderTarget.width;
		this._height = renderTarget.height;

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.renderToScreen = true;

	this.passes = [];

	// dependencies

	if (THREE.CopyShader === undefined) {

		console.error('THREE.EffectComposer relies on THREE.CopyShader');

	}

	if (THREE.ShaderPass === undefined) {

		console.error('THREE.EffectComposer relies on THREE.ShaderPass');

	}

	this.copyPass = new THREE.ShaderPass(THREE.CopyShader);

	this.clock = new THREE.Clock();

};

Object.assign(THREE.EffectComposer.prototype, {

	swapBuffers: function () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function (pass) {

		this.passes.push(pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

	},

	insertPass: function (pass, index) {

		this.passes.splice(index, 0, pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

	},

	isLastEnabledPass: function (passIndex) {

		for (var i = passIndex + 1; i < this.passes.length; i++) {

			if (this.passes[i].enabled) {

				return false;

			}

		}

		return true;

	},

	render: function (deltaTime) {

		// deltaTime value is in seconds

		if (deltaTime === undefined) {

			deltaTime = this.clock.getDelta();

		}

		var currentRenderTarget = this.renderer.getRenderTarget();

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i++) {

			pass = this.passes[i];

			if (pass.enabled === false) continue;

			pass.renderToScreen = (this.renderToScreen && this.isLastEnabledPass(i));
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

			if (pass.needsSwap) {

				if (maskActive) {

					var context = this.renderer.getContext();
					var stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);

					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
					stencil.setFunc(context.EQUAL, 1, 0xffffffff);

				}

				this.swapBuffers();

			}

			if (THREE.MaskPass !== undefined) {

				if (pass instanceof THREE.MaskPass) {

					maskActive = true;

				} else if (pass instanceof THREE.ClearMaskPass) {

					maskActive = false;

				}

			}

		}

		this.renderer.setRenderTarget(currentRenderTarget);

	},

	reset: function (renderTarget) {

		if (renderTarget === undefined) {

			var size = this.renderer.getSize(new THREE.Vector2());
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function (width, height) {

		this._width = width;
		this._height = height;

		var effectiveWidth = this._width * this._pixelRatio;
		var effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
		this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

		for (var i = 0; i < this.passes.length; i++) {

			this.passes[i].setSize(effectiveWidth, effectiveHeight);

		}

	},

	setPixelRatio: function (pixelRatio) {

		this._pixelRatio = pixelRatio;

		this.setSize(this._width, this._height);

	}

});


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
	this.renderToScreen = false;

};

Object.assign(THREE.Pass.prototype, {

	setSize: function ( /* width, height */) { },

	render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */) {

		console.error('THREE.Pass: .render() must be implemented in derived pass.');

	}

});

// Helper for passes that need to fill the viewport with a single quad.
THREE.Pass.FullScreenQuad = ( function () {

	var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var FullScreenQuad = function ( material ) {

		this._mesh = new THREE.Mesh( geometry, material );

	};

	Object.defineProperty( FullScreenQuad.prototype, 'material', {

		get: function () {

			return this._mesh.material;

		},

		set: function ( value ) {

			this._mesh.material = value;

		}

	} );

	Object.assign( FullScreenQuad.prototype, {

		dispose: function () {

			this._mesh.geometry.dispose();

		},

		render: function ( renderer ) {

			renderer.render( this._mesh, camera );

		}

	} );

	return FullScreenQuad;

} )();

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function (scene, camera, overrideMaterial, clearColor, clearAlpha) {

	THREE.Pass.call(this);

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 0;

	this.clear = true;
	this.clearDepth = false;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

	constructor: THREE.RenderPass,

	render: function (renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		var oldClearColor, oldClearAlpha, oldOverrideMaterial;

		if (this.overrideMaterial !== undefined) {

			oldOverrideMaterial = this.scene.overrideMaterial;

			this.scene.overrideMaterial = this.overrideMaterial;

		}

		if (this.clearColor) {

			oldClearColor = renderer.getClearColor(new THREE.Color()).getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if (this.clearDepth) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
		renderer.render(this.scene, this.camera);

		if (this.clearColor) {

			renderer.setClearColor(oldClearColor, oldClearAlpha);

		}

		if (this.overrideMaterial !== undefined) {

			this.scene.overrideMaterial = oldOverrideMaterial;

		}

		renderer.autoClear = oldAutoClear;

	}

});

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function (shader, textureID) {

	THREE.Pass.call(this);

	this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

	if (shader instanceof THREE.ShaderMaterial) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if (shader) {

		this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

		this.material = new THREE.ShaderMaterial({

			defines: Object.assign({}, shader.defines),
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		});

	}

	this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);

};

THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

	constructor: THREE.ShaderPass,

	render: function (renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

		if (this.uniforms[this.textureID]) {

			this.uniforms[this.textureID].value = readBuffer.texture;

		}

		this.fsQuad.material = this.material;

		if (this.renderToScreen) {

			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);

		} else {

			renderer.setRenderTarget(writeBuffer);
			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
			this.fsQuad.render(renderer);

		}

	}

});

/**
 * @author spidersharma / http://eduperiment.com/
 */

THREE.OutlinePass = function (resolution, scene, camera, selectedObjects) {

	this.renderScene = scene;
	this.renderCamera = camera;
	this.selectedObjects = selectedObjects !== undefined ? selectedObjects : [];
	this.visibleEdgeColor = new THREE.Color(1, 1, 1);
	this.hiddenEdgeColor = new THREE.Color(0.1, 0.04, 0.02);
	this.edgeGlow = 0.0;
	this.usePatternTexture = false;
	this.edgeThickness = 1.0;
	this.edgeStrength = 3.0;
	this.downSampleRatio = 2;
	this.pulsePeriod = 0;

	THREE.Pass.call(this);

	this.resolution = (resolution !== undefined) ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

	var resx = Math.round(this.resolution.x / this.downSampleRatio);
	var resy = Math.round(this.resolution.y / this.downSampleRatio);

	this.maskBufferMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	this.maskBufferMaterial.side = THREE.DoubleSide;
	this.renderTargetMaskBuffer = new THREE.WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
	this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
	this.renderTargetMaskBuffer.texture.generateMipmaps = false;

	this.depthMaterial = new THREE.MeshDepthMaterial();
	this.depthMaterial.side = THREE.DoubleSide;
	this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
	this.depthMaterial.blending = THREE.NoBlending;

	this.prepareMaskMaterial = this.getPrepareMaskMaterial();
	this.prepareMaskMaterial.side = THREE.DoubleSide;
	this.prepareMaskMaterial.fragmentShader = replaceDepthToViewZ(this.prepareMaskMaterial.fragmentShader, this.renderCamera);

	this.renderTargetDepthBuffer = new THREE.WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
	this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
	this.renderTargetDepthBuffer.texture.generateMipmaps = false;

	this.renderTargetMaskDownSampleBuffer = new THREE.WebGLRenderTarget(resx, resy, pars);
	this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample";
	this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

	this.renderTargetBlurBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
	this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
	this.renderTargetBlurBuffer1.texture.generateMipmaps = false;
	this.renderTargetBlurBuffer2 = new THREE.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
	this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
	this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

	this.edgeDetectionMaterial = this.getEdgeDetectionMaterial();
	this.renderTargetEdgeBuffer1 = new THREE.WebGLRenderTarget(resx, resy, pars);
	this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
	this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;
	this.renderTargetEdgeBuffer2 = new THREE.WebGLRenderTarget(Math.round(resx / 2), Math.round(resy / 2), pars);
	this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
	this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;

	var MAX_EDGE_THICKNESS = 4;
	var MAX_EDGE_GLOW = 4;

	this.separableBlurMaterial1 = this.getSeperableBlurMaterial(MAX_EDGE_THICKNESS);
	this.separableBlurMaterial1.uniforms["texSize"].value.set(resx, resy);
	this.separableBlurMaterial1.uniforms["kernelRadius"].value = 1;
	this.separableBlurMaterial2 = this.getSeperableBlurMaterial(MAX_EDGE_GLOW);
	this.separableBlurMaterial2.uniforms["texSize"].value.set(Math.round(resx / 2), Math.round(resy / 2));
	this.separableBlurMaterial2.uniforms["kernelRadius"].value = MAX_EDGE_GLOW;

	// Overlay material
	this.overlayMaterial = this.getOverlayMaterial();

	// copy material
	if (THREE.CopyShader === undefined)
		console.error("THREE.OutlinePass relies on THREE.CopyShader");

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
	this.copyUniforms["opacity"].value = 1.0;

	this.materialCopy = new THREE.ShaderMaterial({
		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.NoBlending,
		depthTest: false,
		depthWrite: false,
		transparent: true
	});

	this.enabled = true;
	this.needsSwap = false;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.fsQuad = new THREE.Pass.FullScreenQuad(null);

	this.tempPulseColor1 = new THREE.Color();
	this.tempPulseColor2 = new THREE.Color();
	this.textureMatrix = new THREE.Matrix4();

	function replaceDepthToViewZ(string, camera) {

		var type = camera.isPerspectiveCamera ? 'perspective' : 'orthographic';

		return string.replace(/DEPTH_TO_VIEW_Z/g, type + 'DepthToViewZ');

	}

};

THREE.OutlinePass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

	constructor: THREE.OutlinePass,

	dispose: function () {

		this.renderTargetMaskBuffer.dispose();
		this.renderTargetDepthBuffer.dispose();
		this.renderTargetMaskDownSampleBuffer.dispose();
		this.renderTargetBlurBuffer1.dispose();
		this.renderTargetBlurBuffer2.dispose();
		this.renderTargetEdgeBuffer1.dispose();
		this.renderTargetEdgeBuffer2.dispose();

	},

	setSize: function (width, height) {

		this.renderTargetMaskBuffer.setSize(width, height);

		var resx = Math.round(width / this.downSampleRatio);
		var resy = Math.round(height / this.downSampleRatio);
		this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
		this.renderTargetBlurBuffer1.setSize(resx, resy);
		this.renderTargetEdgeBuffer1.setSize(resx, resy);
		this.separableBlurMaterial1.uniforms["texSize"].value.set(resx, resy);

		resx = Math.round(resx / 2);
		resy = Math.round(resy / 2);

		this.renderTargetBlurBuffer2.setSize(resx, resy);
		this.renderTargetEdgeBuffer2.setSize(resx, resy);

		this.separableBlurMaterial2.uniforms["texSize"].value.set(resx, resy);

	},

	changeVisibilityOfSelectedObjects: function (bVisible) {

		function gatherSelectedMeshesCallBack(object) {

			if (object.isMesh) {

				if (bVisible) {

					object.visible = object.userData.oldVisible;
					delete object.userData.oldVisible;

				} else {

					object.userData.oldVisible = object.visible;
					object.visible = bVisible;

				}

			}

		}

		for (var i = 0; i < this.selectedObjects.length; i++) {

			var selectedObject = this.selectedObjects[i];
			selectedObject.traverse(gatherSelectedMeshesCallBack);

		}

	},

	changeVisibilityOfNonSelectedObjects: function (bVisible) {

		var selectedMeshes = [];

		function gatherSelectedMeshesCallBack(object) {

			if (object.isMesh) selectedMeshes.push(object);

		}

		for (var i = 0; i < this.selectedObjects.length; i++) {

			var selectedObject = this.selectedObjects[i];
			selectedObject.traverse(gatherSelectedMeshesCallBack);

		}

		function VisibilityChangeCallBack(object) {

			if (object.isMesh || object.isLine || object.isSprite) {

				var bFound = false;

				for (var i = 0; i < selectedMeshes.length; i++) {

					var selectedObjectId = selectedMeshes[i].id;

					if (selectedObjectId === object.id) {

						bFound = true;
						break;

					}

				}

				if (!bFound) {

					var visibility = object.visible;

					if (!bVisible || object.bVisible) object.visible = bVisible;

					object.bVisible = visibility;

				}

			}

		}

		this.renderScene.traverse(VisibilityChangeCallBack);

	},

	updateTextureMatrix: function () {

		this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0);
		this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
		this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);

	},

	render: function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {

		if (this.selectedObjects.length > 0) {

			this.oldClearColor.copy(renderer.getClearColor(new THREE.Color()));
			this.oldClearAlpha = renderer.getClearAlpha();
			var oldAutoClear = renderer.autoClear;

			renderer.autoClear = false;

			if (maskActive) renderer.state.buffers.stencil.setTest(false);

			renderer.setClearColor(0xffffff, 1);

			// Make selected objects invisible
			this.changeVisibilityOfSelectedObjects(false);

			var currentBackground = this.renderScene.background;
			this.renderScene.background = null;

			// 1. Draw Non Selected objects in the depth buffer
			this.renderScene.overrideMaterial = this.depthMaterial;
			renderer.setRenderTarget(this.renderTargetDepthBuffer);
			renderer.clear();
			renderer.render(this.renderScene, this.renderCamera);

			// Make selected objects visible
			this.changeVisibilityOfSelectedObjects(true);

			// Update Texture Matrix for Depth compare
			this.updateTextureMatrix();

			// Make non selected objects invisible, and draw only the selected objects, by comparing the depth buffer of non selected objects
			this.changeVisibilityOfNonSelectedObjects(false);
			this.renderScene.overrideMaterial = this.prepareMaskMaterial;
			this.prepareMaskMaterial.uniforms["cameraNearFar"].value.set(this.renderCamera.near, this.renderCamera.far);
			this.prepareMaskMaterial.uniforms["depthTexture"].value = this.renderTargetDepthBuffer.texture;
			this.prepareMaskMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
			renderer.setRenderTarget(this.renderTargetMaskBuffer);
			renderer.clear();
			renderer.render(this.renderScene, this.renderCamera);
			this.renderScene.overrideMaterial = null;
			this.changeVisibilityOfNonSelectedObjects(true);

			this.renderScene.background = currentBackground;

			// 2. Downsample to Half resolution
			this.fsQuad.material = this.materialCopy;
			this.copyUniforms["tDiffuse"].value = this.renderTargetMaskBuffer.texture;
			renderer.setRenderTarget(this.renderTargetMaskDownSampleBuffer);
			renderer.clear();
			this.fsQuad.render(renderer);

			this.tempPulseColor1.copy(this.visibleEdgeColor);
			this.tempPulseColor2.copy(this.hiddenEdgeColor);

			if (this.pulsePeriod > 0) {

				var scalar = (1 + 0.25) / 2 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * (1.0 - 0.25) / 2;
				this.tempPulseColor1.multiplyScalar(scalar);
				this.tempPulseColor2.multiplyScalar(scalar);

			}

			// 3. Apply Edge Detection Pass
			this.fsQuad.material = this.edgeDetectionMaterial;
			this.edgeDetectionMaterial.uniforms["maskTexture"].value = this.renderTargetMaskDownSampleBuffer.texture;
			this.edgeDetectionMaterial.uniforms["texSize"].value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height);
			this.edgeDetectionMaterial.uniforms["visibleEdgeColor"].value = this.tempPulseColor1;
			this.edgeDetectionMaterial.uniforms["hiddenEdgeColor"].value = this.tempPulseColor2;
			renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
			renderer.clear();
			this.fsQuad.render(renderer);

			// 4. Apply Blur on Half res
			this.fsQuad.material = this.separableBlurMaterial1;
			this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
			this.separableBlurMaterial1.uniforms["direction"].value = THREE.OutlinePass.BlurDirectionX;
			this.separableBlurMaterial1.uniforms["kernelRadius"].value = this.edgeThickness;
			renderer.setRenderTarget(this.renderTargetBlurBuffer1);
			renderer.clear();
			this.fsQuad.render(renderer);
			this.separableBlurMaterial1.uniforms["colorTexture"].value = this.renderTargetBlurBuffer1.texture;
			this.separableBlurMaterial1.uniforms["direction"].value = THREE.OutlinePass.BlurDirectionY;
			renderer.setRenderTarget(this.renderTargetEdgeBuffer1);
			renderer.clear();
			this.fsQuad.render(renderer);

			// Apply Blur on quarter res
			this.fsQuad.material = this.separableBlurMaterial2;
			this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetEdgeBuffer1.texture;
			this.separableBlurMaterial2.uniforms["direction"].value = THREE.OutlinePass.BlurDirectionX;
			renderer.setRenderTarget(this.renderTargetBlurBuffer2);
			renderer.clear();
			this.fsQuad.render(renderer);
			this.separableBlurMaterial2.uniforms["colorTexture"].value = this.renderTargetBlurBuffer2.texture;
			this.separableBlurMaterial2.uniforms["direction"].value = THREE.OutlinePass.BlurDirectionY;
			renderer.setRenderTarget(this.renderTargetEdgeBuffer2);
			renderer.clear();
			this.fsQuad.render(renderer);

			// Blend it additively over the input texture
			this.fsQuad.material = this.overlayMaterial;
			this.overlayMaterial.uniforms["maskTexture"].value = this.renderTargetMaskBuffer.texture;
			this.overlayMaterial.uniforms["edgeTexture1"].value = this.renderTargetEdgeBuffer1.texture;
			this.overlayMaterial.uniforms["edgeTexture2"].value = this.renderTargetEdgeBuffer2.texture;
			this.overlayMaterial.uniforms["patternTexture"].value = this.patternTexture;
			this.overlayMaterial.uniforms["edgeStrength"].value = this.edgeStrength;
			this.overlayMaterial.uniforms["edgeGlow"].value = this.edgeGlow;
			this.overlayMaterial.uniforms["usePatternTexture"].value = this.usePatternTexture;


			if (maskActive) renderer.state.buffers.stencil.setTest(true);

			renderer.setRenderTarget(readBuffer);
			this.fsQuad.render(renderer);

			renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
			renderer.autoClear = oldAutoClear;

		}

		if (this.renderToScreen) {

			this.fsQuad.material = this.materialCopy;
			this.copyUniforms["tDiffuse"].value = readBuffer.texture;
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);

		}

	},

	getPrepareMaskMaterial: function () {

		return new THREE.ShaderMaterial({

			uniforms: {
				"depthTexture": { value: null },
				"cameraNearFar": { value: new THREE.Vector2(0.5, 0.5) },
				"textureMatrix": { value: null }
			},

			vertexShader: [
				'#include <morphtarget_pars_vertex>',
				'#include <skinning_pars_vertex>',

				'varying vec4 projTexCoord;',
				'varying vec4 vPosition;',
				'uniform mat4 textureMatrix;',

				'void main() {',

				'	#include <skinbase_vertex>',
				'	#include <begin_vertex>',
				'	#include <morphtarget_vertex>',
				'	#include <skinning_vertex>',
				'	#include <project_vertex>',

				'	vPosition = mvPosition;',
				'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
				'	projTexCoord = textureMatrix * worldPosition;',

				'}'
			].join('\n'),

			fragmentShader: [
				'#include <packing>',
				'varying vec4 vPosition;',
				'varying vec4 projTexCoord;',
				'uniform sampler2D depthTexture;',
				'uniform vec2 cameraNearFar;',

				'void main() {',

				'	float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));',
				'	float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );',
				'	float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;',
				'	gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);',

				'}'
			].join('\n')

		});

	},

	getEdgeDetectionMaterial: function () {

		return new THREE.ShaderMaterial({

			uniforms: {
				"maskTexture": { value: null },
				"texSize": { value: new THREE.Vector2(0.5, 0.5) },
				"visibleEdgeColor": { value: new THREE.Vector3(1.0, 1.0, 1.0) },
				"hiddenEdgeColor": { value: new THREE.Vector3(1.0, 1.0, 1.0) },
			},

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"varying vec2 vUv;\
				uniform sampler2D maskTexture;\
				uniform vec2 texSize;\
				uniform vec3 visibleEdgeColor;\
				uniform vec3 hiddenEdgeColor;\
				\
				void main() {\n\
					vec2 invSize = 1.0 / texSize;\
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);\
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);\
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);\
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);\
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);\
					float diff1 = (c1.r - c2.r)*0.5;\
					float diff2 = (c3.r - c4.r)*0.5;\
					float d = length( vec2(diff1, diff2) );\
					float a1 = min(c1.g, c2.g);\
					float a2 = min(c3.g, c4.g);\
					float visibilityFactor = min(a1, a2);\
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;\
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);\
				}"
		});

	},

	getSeperableBlurMaterial: function (maxRadius) {

		return new THREE.ShaderMaterial({

			defines: {
				"MAX_RADIUS": maxRadius,
			},

			uniforms: {
				"colorTexture": { value: null },
				"texSize": { value: new THREE.Vector2(0.5, 0.5) },
				"direction": { value: new THREE.Vector2(0.5, 0.5) },
				"kernelRadius": { value: 1.0 }
			},

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"#include <common>\
				varying vec2 vUv;\
				uniform sampler2D colorTexture;\
				uniform vec2 texSize;\
				uniform vec2 direction;\
				uniform float kernelRadius;\
				\
				float gaussianPdf(in float x, in float sigma) {\
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
				}\
				void main() {\
					vec2 invSize = 1.0 / texSize;\
					float weightSum = gaussianPdf(0.0, kernelRadius);\
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\
					vec2 uvOffset = delta;\
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {\
						float w = gaussianPdf(uvOffset.x, kernelRadius);\
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\
						diffuseSum += ((sample1 + sample2) * w);\
						weightSum += (2.0 * w);\
						uvOffset += delta;\
					}\
					gl_FragColor = diffuseSum/weightSum;\
				}"
		});

	},

	getOverlayMaterial: function () {

		return new THREE.ShaderMaterial({

			uniforms: {
				"maskTexture": { value: null },
				"edgeTexture1": { value: null },
				"edgeTexture2": { value: null },
				"patternTexture": { value: null },
				"edgeStrength": { value: 1.0 },
				"edgeGlow": { value: 1.0 },
				"usePatternTexture": { value: 0.0 }
			},

			vertexShader:
				"varying vec2 vUv;\n\
				void main() {\n\
					vUv = uv;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"varying vec2 vUv;\
				uniform sampler2D maskTexture;\
				uniform sampler2D edgeTexture1;\
				uniform sampler2D edgeTexture2;\
				uniform sampler2D patternTexture;\
				uniform float edgeStrength;\
				uniform float edgeGlow;\
				uniform bool usePatternTexture;\
				\
				void main() {\
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);\
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);\
					vec4 maskColor = texture2D(maskTexture, vUv);\
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);\
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;\
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;\
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;\
					if(usePatternTexture)\
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);\
					gl_FragColor = finalColor;\
				}",
			blending: THREE.AdditiveBlending,
			depthTest: false,
			depthWrite: false,
			transparent: true
		});

	}

});

THREE.OutlinePass.BlurDirectionX = new THREE.Vector2(1.0, 0.0);
THREE.OutlinePass.BlurDirectionY = new THREE.Vector2(0.0, 1.0);
THREE.MaskPass = function (scene, camera) {

	THREE.Pass.call(this);

	this.scene = scene;
	this.camera = camera;

	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {

	constructor: THREE.MaskPass,

	render: function (renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

		var context = renderer.getContext();
		var state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask(false);
		state.buffers.depth.setMask(false);

		// lock buffers

		state.buffers.color.setLocked(true);
		state.buffers.depth.setLocked(true);

		// set up stencil

		var writeValue, clearValue;

		if (this.inverse) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest(true);
		state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
		state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
		state.buffers.stencil.setClear(clearValue);
		state.buffers.stencil.setLocked(true);

		// draw into the stencil buffer

		renderer.setRenderTarget(readBuffer);
		if (this.clear) renderer.clear();
		renderer.render(this.scene, this.camera);

		renderer.setRenderTarget(writeBuffer);
		if (this.clear) renderer.clear();
		renderer.render(this.scene, this.camera);

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked(false);
		state.buffers.depth.setLocked(false);

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked(false);
		state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff); // draw if == 1
		state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
		state.buffers.stencil.setLocked(true);

	}

});


THREE.ClearMaskPass = function () {

	THREE.Pass.call(this);

	this.needsSwap = false;

};

THREE.ClearMaskPass.prototype = Object.create(THREE.Pass.prototype);

Object.assign(THREE.ClearMaskPass.prototype, {

	render: function (renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */) {

		renderer.state.buffers.stencil.setLocked(false);
		renderer.state.buffers.stencil.setTest(false);

	}

});








AFRAME.registerComponent('hover-highlighter', {
  schema: {
    strength: {type: 'number', default: 2.0},
    glow: {type: 'number', default: 1},
    color: {type: 'string', default: 'tomato'}
  },
  init: function () {
    this.el.addEventListener('that', evt => this.onEnter());
    this.el.addEventListener('mouseleave', evt => this.onLeave());
    setTimeout(() => this.el.emit("that"), 2000);
  },
  onEnter: function () {
    const scene = this.el.sceneEl.object3D;
    const camera = this.el.sceneEl.camera;
    const renderer = this.el.sceneEl.renderer;
    const render = renderer.render;
    const composer = new THREE.EffectComposer(renderer);
    let renderPass = new THREE.RenderPass(scene, camera);
    let outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    composer.addPass(renderPass);
    composer.addPass(outlinePass);
    let objects = [];
    this.el.object3D.traverse(node => {
      if (!node.isMesh) return;
      objects.push(node);
    });
    outlinePass.selectedObjects = objects;
    outlinePass.renderToScreen = true;
    outlinePass.edgeStrength = this.data.strength;
    outlinePass.edgeGlow = this.data.glow;
    outlinePass.visibleEdgeColor.set(this.data.color);
    // HACK the AFRAME render method (a bit ugly)
    const clock = new THREE.Clock();
    this.originalRenderMethod = render;
    let calledByComposer = false;
		renderer.render = function () {
      if (calledByComposer) {
        render.apply(renderer, arguments);
      } else {
        calledByComposer = true;
        composer.render(clock.getDelta());
        calledByComposer = false;
      }
    };
  },
  onLeave: function () {
    this.el.sceneEl.renderer.render = this.originalRenderMethod;
  },
  remove: function () {
    this.onLeave();
  }
});

class App {
  constructor(container, options = {}) {
    // Init ThreeJS Basics
    this.options = options;

    if (this.options.distortion == null) {
      this.options.distortion = {
        uniforms: distortion_uniforms,
        getDistortion: distortion_vertex
      };
    }
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(1);
    this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
    container.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      options.fov,
      container.offsetWidth / container.offsetHeight,
      0.1,
      10000
    );
    this.camera.position.z = -5;
    this.camera.position.y = 8;
    this.camera.position.x = 0;
    // this.camera.rotateX(-0.4);
    this.scene = new THREE.Scene();

    let fog = new THREE.Fog(
      options.colors.background,
      options.length * 0.2,
      options.length * 500
    );
    this.scene.fog = fog;
    this.fogUniforms = {
      fogColor: { type: "c", value: fog.color },
      fogNear: { type: "f", value: fog.near },
      fogFar: { type: "f", value: fog.far }
    };
    this.clock = new THREE.Clock();
    this.assets = {};
    this.disposed = false;

    // Create Objects
    this.road = new Road(this, options);
    this.leftCarLights = new CarLights(
      this,
      options,
      options.colors.leftCars,
      options.movingAwaySpeed,
      new THREE.Vector2(0, 1 - options.carLightsFade)
    );
    this.rightCarLights = new CarLights(
      this,
      options,
      options.colors.rightCars,
      options.movingCloserSpeed,
      new THREE.Vector2(1, 0 + options.carLightsFade)
    );
    this.leftSticks = new LightsSticks(this, options);

    this.fovTarget = options.fov;

    this.speedUpTarget = 0;
    this.speedUp = 0;
    this.timeOffset = 0;

    // Binds
    this.tick = this.tick.bind(this);
    this.init = this.init.bind(this);
    this.setSize = this.setSize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }
  initPasses() {
    this.renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera);
    this.bloomPass = new POSTPROCESSING.EffectPass(
      this.camera,
      new POSTPROCESSING.BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0,
        resolutionScale: 1
      })
    );
    console.log(this.assets.smaa, this.camera);
    const smaaPass = new POSTPROCESSING.EffectPass(
      this.camera,
      new POSTPROCESSING.SMAAEffect(
        this.assets.smaa.search,
        this.assets.smaa.area,
        POSTPROCESSING.SMAAPreset.MEDIUM
      )
    );
    this.renderPass.renderToScreen = false;
    this.bloomPass.renderToScreen = false;
    smaaPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(smaaPass);
  }
  loadAssets() {
    const assets = this.assets;
    return new Promise((resolve, reject) => {
      const manager = new THREE.LoadingManager(resolve);

      const searchImage = new Image();
      const areaImage = new Image();
      assets.smaa = {};
      searchImage.addEventListener("load", function() {
        assets.smaa.search = this;
        manager.itemEnd("smaa-search");
      });

      areaImage.addEventListener("load", function() {
        assets.smaa.area = this;
        manager.itemEnd("smaa-area");
      });
      manager.itemStart("smaa-search");
      manager.itemStart("smaa-area");

      searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
      areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
    });
  }
  init() {
    this.initPasses();
    const options = this.options;
    this.road.init();
    this.leftCarLights.init();

    this.leftCarLights.mesh.position.setX(
      -options.roadWidth / 2 - options.islandWidth / 2
    );
    this.rightCarLights.init();
    this.rightCarLights.mesh.position.setX(
      options.roadWidth / 2 + options.islandWidth / 2
    );
    this.leftSticks.init();
    this.leftSticks.mesh.position.setX(
      -(options.roadWidth + options.islandWidth / 2)
    );

    this.container.addEventListener("mousedown", this.onMouseDown);
    this.container.addEventListener("mouseup", this.onMouseUp);
    this.container.addEventListener("mouseout", this.onMouseUp);

    this.tick();
  }
  onMouseDown(ev) {
    if (this.options.onSpeedUp) this.options.onSpeedUp(ev);
    this.fovTarget = this.options.fovSpeedUp;
    this.speedUpTarget = this.options.speedUp;
  }
  onMouseUp(ev) {
    if (this.options.onSlowDown) this.options.onSlowDown(ev);
    this.fovTarget = this.options.fov;
    this.speedUpTarget = 0;
    // this.speedupLerp = 0.1;
  }
  update(delta) {
    let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp += lerp(
      this.speedUp,
      this.speedUpTarget,
      lerpPercentage,
      0.00001
    );
    this.timeOffset += this.speedUp * delta;

    let time = this.clock.elapsedTime + this.timeOffset;

    this.rightCarLights.update(time);
    this.leftCarLights.update(time);
    this.leftSticks.update(time);
    this.road.update(time);

    let updateCamera = false;
    let fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta * 6;
      updateCamera = true;
    }

    if (this.options.distortion.getJS) {
      const distortion = this.options.distortion.getJS(0.025, time);

      this.camera.lookAt(
        new THREE.Vector3(
          this.camera.position.x + distortion.x,
          this.camera.position.y + distortion.y,
          this.camera.position.z + distortion.z
        )
      );
      updateCamera = true;
    }
    if (updateCamera) {
      this.camera.updateProjectionMatrix();
    }
  }
  render(delta) {
    this.composer.render(delta);
  }
  dispose() {
    this.disposed = true;
  }
  setSize(width, height, updateStyles) {
    this.composer.setSize(width, height, updateStyles);
  }
  tick() {
    if (this.disposed || !this) return;
    if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    const delta = this.clock.getDelta();
    this.render(delta);
    this.update(delta);
    requestAnimationFrame(this.tick);
  }
}

const distortion_uniforms = {
  uDistortionX: new THREE.Uniform(new THREE.Vector2(80, 3)),
  uDistortionY: new THREE.Uniform(new THREE.Vector2(-40, 2.5))
};

const distortion_vertex = `
#define PI 3.14159265358979
  uniform vec2 uDistortionX;
  uniform vec2 uDistortionY;
    float nsin(float val){
    return sin(val) * 0.5+0.5;
    }
  vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`;

const random = base => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
};
const pickRandom = arr => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
};
function lerp(current, target, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
}
class CarLights {
  constructor(webgl, options, colors, speed, fade) {
    this.webgl = webgl;
    this.options = options;
    this.colors = colors;
    this.speed = speed;
    this.fade = fade;
  }
  init() {
    const options = this.options;
    // Curve with length 1
    let curve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    );
    // Tube with radius = 1
    let geometry = new THREE.TubeBufferGeometry(curve, 40, 1, 8, false);

    let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
    instanced.maxInstancedCount = options.lightPairsPerRoadWay * 2;

    let laneWidth = options.roadWidth / options.lanesPerRoad;

    let aOffset = [];
    let aMetrics = [];
    let aColor = [];

    let colors = this.colors;
    if (Array.isArray(colors)) {
      colors = colors.map(c => new THREE.Color(c));
    } else {
      colors = new THREE.Color(colors);
    }

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      let radius = random(options.carLightsRadius);
      let length = random(options.carLightsLength);
      let speed = random(this.speed);

      let carLane = i % 3;
      let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;

      let carWidth = random(options.carWidthPercentage) * laneWidth;
      // Drunk Driving
      let carShiftX = random(options.carShiftX) * laneWidth;
      // Both lights share same shiftX and lane;
      laneX += carShiftX;

      let offsetY = random(options.carFloorSeparation) + radius * 1.3;

      let offsetZ = -random(options.length);

      aOffset.push(laneX - carWidth / 2);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

      aOffset.push(laneX + carWidth / 2);
      aOffset.push(offsetY);
      aOffset.push(offsetZ);

      aMetrics.push(radius);
      aMetrics.push(length);
      aMetrics.push(speed);

      aMetrics.push(radius);
      aMetrics.push(length);
      aMetrics.push(speed);

      let color = pickRandom(colors);
      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);

      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);
    }
    instanced.addAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
    );
    instanced.addAttribute(
      "aMetrics",
      new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false)
    );
    instanced.addAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
    );
    let material = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      transparent: true,
      uniforms: Object.assign(
        {
          // uColor: new THREE.Uniform(new THREE.Color(this.color)),
          uTime: new THREE.Uniform(0),
          uTravelLength: new THREE.Uniform(options.length),
          uFade: new THREE.Uniform(this.fade)
        },
        this.webgl.fogUniforms,
        options.distortion.uniforms
      )
    });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <getDistortion_vertex>",
        options.distortion.getDistortion
      );
      console.log(shader.vertex);
    };
    let mesh = new THREE.Mesh(instanced, material);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }
  update(time) {
    this.mesh.material.uniforms.uTime.value = time;
  }
}

const carLightsFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk["fog_pars_fragment"]}
  varying vec3 vColor;
  varying vec2 vUv; 
  uniform vec2 uFade;
  void main() {
  vec3 color = vec3(vColor);
  float fadeStart = 0.4;
  float maxFade = 0.;
  float alpha = 1.;
  
  alpha = smoothstep(uFade.x, uFade.y, vUv.x);
  gl_FragColor = vec4(color,alpha);
  if (gl_FragColor.a < 0.0001) discard;
  ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

const carLightsVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk["fog_pars_vertex"]}
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;
  
  uniform float uTravelLength;
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vUv; 
  varying vec3 vColor; 
  #include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;
    transformed.xy *= radius ;
    transformed.z *= myLength;
  
    // Add my length to make sure it loops after the lights hits the end
    transformed.z += myLength-mod( uTime *speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
    ${THREE.ShaderChunk["fog_vertex"]}
  }`;

class LightsSticks {
  constructor(webgl, options) {
    this.webgl = webgl;
    this.options = options;
  }
  init() {
    const options = this.options;
    const geometry = new THREE.PlaneBufferGeometry(1, 1);
    let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
    let totalSticks = options.totalSideLightSticks;
    instanced.maxInstancedCount = totalSticks;

    let stickoffset = options.length / (totalSticks - 1);
    const aOffset = [];
    const aColor = [];
    const aMetrics = [];

    let colors = options.colors.sticks;
    if (Array.isArray(colors)) {
      colors = colors.map(c => new THREE.Color(c));
    } else {
      colors = new THREE.Color(colors);
    }

    for (let i = 0; i < totalSticks; i++) {
      let width = random(options.lightStickWidth);
      let height = random(options.lightStickHeight);
      aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

      let color = pickRandom(colors);
      aColor.push(color.r);
      aColor.push(color.g);
      aColor.push(color.b);

      aMetrics.push(width);
      aMetrics.push(height);
    }
    instanced.addAttribute(
      "aOffset",
      new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false)
    );
    instanced.addAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
    );
    instanced.addAttribute(
      "aMetrics",
      new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
    );
    const material = new THREE.ShaderMaterial({
      fragmentShader: sideSticksFragment,
      vertexShader: sideSticksVertex,
      // This ones actually need double side
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new THREE.Uniform(options.length),
          uTime: new THREE.Uniform(0)
        },
        this.webgl.fogUniforms,
        options.distortion.uniforms
      )
    });

    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <getDistortion_vertex>",
        options.distortion.getDistortion
      );
    };

    const mesh = new THREE.Mesh(instanced, material);
    // The object is behind the camera before the vertex shader
    mesh.frustumCulled = false;
    // mesh.position.y = options.lightStickHeight / 2;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }
  update(time) {
    this.mesh.material.uniforms.uTime.value = time;
  }
}

const sideSticksVertex = `
#define USE_FOG;
${THREE.ShaderChunk["fog_pars_vertex"]}
attribute float aOffset;
attribute vec3 aColor;
attribute vec2 aMetrics;
uniform float uTravelLength;
uniform float uTime;
varying vec3 vColor;
mat4 rotationY( in float angle ) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}
  #include <getDistortion_vertex>
  void main(){
    vec3 transformed = position.xyz;
    float width = aMetrics.x;
    float height = aMetrics.y;
    transformed.xy *= vec2(width,height);
    float time = mod(uTime  * 60. *2. + aOffset , uTravelLength);
    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
    transformed.z +=  - uTravelLength + time;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    transformed.y += height /2.;
    transformed.x += -width/2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    ${THREE.ShaderChunk["fog_vertex"]}
  }
`;
const sideSticksFragment = `
#define USE_FOG;
${THREE.ShaderChunk["fog_pars_fragment"]}
varying vec3 vColor;
  void main(){
    vec3 color = vec3(vColor);
    gl_FragColor = vec4(color,1.);
    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

class Road {
  constructor(webgl, options) {
    this.webgl = webgl;
    this.options = options;

    this.uTime = new THREE.Uniform(0);
  }
  createIsland() {
    const options = this.options;
    let segments = 100;
  }
  // Side  = 0 center, = 1 right = -1 left
  createPlane(side, width, isRoad) {
    const options = this.options;
    let segments = 100;
    const geometry = new THREE.PlaneBufferGeometry(
      isRoad ? options.roadWidth : options.islandWidth,
      options.length,
      20,
      segments
    );
    let uniforms = {
      uTravelLength: new THREE.Uniform(options.length),
      uColor: new THREE.Uniform(
        new THREE.Color(
          isRoad ? options.colors.roadColor : options.colors.islandColor
        )
      ),
      uTime: this.uTime
    };
    if (isRoad) {
      uniforms = Object.assign(uniforms, {
        uLanes: new THREE.Uniform(options.lanesPerRoad),
        uBrokenLinesColor: new THREE.Uniform(
          new THREE.Color(options.colors.brokenLines)
        ),
        uShoulderLinesColor: new THREE.Uniform(
          new THREE.Color(options.colors.shoulderLines)
        ),
        uShoulderLinesWidthPercentage: new THREE.Uniform(
          options.shoulderLinesWidthPercentage
        ),
        uBrokenLinesLengthPercentage: new THREE.Uniform(
          options.brokenLinesLengthPercentage
        ),
        uBrokenLinesWidthPercentage: new THREE.Uniform(
          options.brokenLinesWidthPercentage
        )
      });
    }
    const material = new THREE.ShaderMaterial({
      fragmentShader: isRoad ? roadFragment : islandFragment,
      vertexShader: roadVertex,
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        uniforms,
        this.webgl.fogUniforms,
        options.distortion.uniforms
      )
    });

    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <getDistortion_vertex>",
        options.distortion.getDistortion
      );
    };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    // Push it half further away
    mesh.position.z = -options.length / 2;
    mesh.position.x +=
      (this.options.islandWidth / 2 + options.roadWidth / 2) * side;
    this.webgl.scene.add(mesh);

    return mesh;
  }
  init() {
    this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
    this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
    this.island = this.createPlane(0, this.options.islandWidth, false);
  }
  update(time) {
    this.uTime.value = time;
  }
}

const roadBaseFragment = `
    #define USE_FOG;
    varying vec2 vUv; 
    uniform vec3 uColor;
    uniform float uTime;
    #include <roadMarkings_vars>
    ${THREE.ShaderChunk["fog_pars_fragment"]}
    void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        
        #include <roadMarkings_fragment>
        gl_FragColor = vec4(color,1.);
        ${THREE.ShaderChunk["fog_fragment"]}
    }
`;
const islandFragment = roadBaseFragment
  .replace("#include <roadMarkings_fragment>", "")
  .replace("#include <roadMarkings_vars>", "");
const roadMarkings_vars = `
    uniform float uLanes;
    uniform vec3 uBrokenLinesColor;
    uniform vec3 uShoulderLinesColor;
    uniform float uShoulderLinesWidthPercentage;
    uniform float uBrokenLinesWidthPercentage;
    uniform float uBrokenLinesLengthPercentage;
    highp float random(vec2 co)
    {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt= dot(co.xy ,vec2(a,b));
        highp float sn= mod(dt,3.14);
        return fract(sin(sn) * c);
    }
`;
const roadMarkings_fragment = `
        uv.y = mod(uv.y + uTime * 0.1,1.);
        float brokenLineWidth = 1. / uLanes * uBrokenLinesWidthPercentage;
        // How much % of the lane's space is empty
        float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
        // Horizontal * vertical offset
        float brokenLines = step(1.-brokenLineWidth * uLanes,fract(uv.x * uLanes)) * step(laneEmptySpace, fract(uv.y * 100.)) ;
        // Remove right-hand lines on the right-most lane
        brokenLines *= step(uv.x * uLanes,uLanes-1.);
        color = mix(color, uBrokenLinesColor, brokenLines);
        float shoulderLinesWidth = 1. / uLanes * uShoulderLinesWidthPercentage;
        float shoulderLines = step(1.-shoulderLinesWidth, uv.x) + step(uv.x, shoulderLinesWidth);
        color = mix(color, uBrokenLinesColor, shoulderLines);
        vec2 noiseFreq = vec2(4., 7000.);
        float roadNoise = random( floor(uv * noiseFreq)/noiseFreq ) * 0.02 - 0.01; 
        color += roadNoise;
`;
const roadFragment = roadBaseFragment
  .replace("#include <roadMarkings_fragment>", roadMarkings_fragment)
  .replace("#include <roadMarkings_vars>", roadMarkings_vars);

const roadVertex = `
#define USE_FOG;
uniform float uTime;
${THREE.ShaderChunk["fog_pars_vertex"]}
uniform float uTravelLength;
varying vec2 vUv; 
  #include <getDistortion_vertex>
void main() {
  vec3 transformed = position.xyz;
    vec3 distortion  = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
    transformed.x += distortion.x;
    transformed.z += distortion.y;
  transformed.y += -1.*distortion.z;  
  
  vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  ${THREE.ShaderChunk["fog_vertex"]}
}`;

function resizeRendererToDisplaySize(renderer, setSize) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    setSize(width, height, false);
  }
  return needResize;
}