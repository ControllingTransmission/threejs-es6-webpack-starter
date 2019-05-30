import * as THREE from "three";
// TODO: OrbitControls import three.js on its own, so the webpack bundle includes three.js twice!
import OrbitControls from "orbit-controls-es6";
import { Interaction } from "three.interaction";
import bindKeys from "./keys.js";

import * as Detector from "../js/vendor/Detector";
import * as DAT from "../js/vendor/dat.gui.min";
import * as checkerboard from "../textures/checkerboard.jpg";
import * as star from "../textures/star.png";
import * as vertexSkybox from "../glsl/skybox/vertexShader.glsl";
import * as fragmentSkybox from "../glsl/skybox/fragmentShader.glsl";
import * as vertexNoOp from "../glsl/noop/vertexShader.glsl";
import * as fragmentNoOp from "../glsl/noop/fragmentShader.glsl";
import * as vertexFade from "../glsl/deform/vertexShader.glsl";
import * as fragmentFade from "../glsl/deform/fragmentShader.glsl";

import { AnimationEffect } from './effects'


const CAMERA_NAME = "Perspective Camera";
const DIRECTIONAL_LIGHT_NAME = "Directional Light";
const SPOT_LIGHT_NAME = "Spotlight";
const CUSTOM_MESH_NAME = "Custom Mesh";

export class Application {
  constructor(opts = {}) {
    if (opts.container) {
      this.container = opts.container;
    } else {
      this.createContainer();
    }
    this.showHelpers = opts.showHelpers ? true : false;
    this.textureLoader = new THREE.TextureLoader();

    if (Detector.webgl) {
      this.bindEventHandlers();
      this.init();
      this.render();
    } else {
      // console.warn("WebGL NOT supported in your browser!");
      const warning = Detector.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }
  }

  /**
   * Bind event handlers to the Application instance.
   */
  bindEventHandlers() {
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    bindKeys(this);
  }

  init() {
    window.addEventListener("resize", this.handleResize);
    this.setupClock();
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    const interaction = new Interaction(this.renderer, this.scene, this.camera);
    this.setupLights();
    this.setupRay();
    this.setupControls();
    this.setupUniforms();

    // this.setupGUI();

    // this.addFloor(100, 100);
    this.addSkybox(1500);
    this.addCustomMesh();

    // const particleSpecs = { spread: { x: 50, y: 100, z: 50 } };
    // this.addParticleSystem(300, 5, particleSpecs);

    // const boxSpecs = {
    //   depth: 20,
    //   height: 10,
    //   spread: { x: 100, y: 100, z: 50 },
    //   width: 5,
    // };
    // this.addGroupObject(20, boxSpecs);
  }

  render() {
    this.updateUniforms();
    this.controls.update();
    this.updateSkybox();
    this.updateGroupObject();
    // this.updateCustomMesh();
    // this.updateCube();
    this.renderer.render(this.scene, this.camera);
    // when render is invoked via requestAnimationFrame(this.render) there is
    // no 'this', so either we bind it explicitly or use an es6 arrow function.
    // requestAnimationFrame(this.render.bind(this));
    requestAnimationFrame(() => this.render());
  }

  /**
   * Create a div element which will contain the Three.js canvas.
   */
  createContainer() {
    const elements = document.getElementsByClassName("app");
    if (elements.length !== 1) {
      alert("You need to have exactly ONE <div class='app' /> in your HTML");
    }
    const app = elements[0];
    const div = document.createElement("div");
    div.setAttribute("class", "canvas-container");
    app.appendChild(div);
    this.container = div;
  }

  handleClick(event) {
    const [x, y] = this.getNDCCoordinates(event, true);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const hexColor = Math.random() * 0xffffff;
      const intersection = intersects[0];
      intersection.object.material.color.setHex(hexColor);

      const { direction, origin } = this.raycaster.ray;
      const arrow = new THREE.ArrowHelper(direction, origin, 100, hexColor);
      this.scene.add(arrow);
    }
  }

  handleMouseMove(event) {
    const [x, y] = this.getNDCCoordinates(event);
  }

  handleResize(event) {
    // console.warn(event);
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  setupClock() {
    this.clock = new THREE.Clock();
  }

  /**
   * Setup a Three.js scene.
   * Setting the scene is the first Three.js-specific code to perform.
   */
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.autoUpdate = true;
    // Let's say we want to define the background color only once throughout the
    // application. This can be done in CSS. So here we use JS to get a property
    // defined in a CSS.
    const style = window.getComputedStyle(this.container);
    const color = new THREE.Color(style.getPropertyValue("background-color"));
    this.scene.background = color;
    this.scene.fog = null;
    // Any Three.js object in the scene (and the scene itself) can have a name.
    this.scene.name = "My Three.js Scene";
  }

  /**
   * Create a Three.js renderer.
   * We let the renderer create a canvas element where to draw its output, then
   * we set the canvas size, we add the canvas to the DOM and we bind event
   * listeners to it.
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setClearColor(0xd3d3d3);  // it's a light gray
    this.renderer.setClearColor(0x222222); // it's a dark gray
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener("click", this.handleClick);
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.handleMouseMove
    );
  }

  setupCamera() {
    const fov = 40;
    const { clientWidth, clientHeight } = this.container;
    const aspect = clientWidth / clientHeight;
    const near = 0.1;
    const far = 10000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.name = CAMERA_NAME;
    this.camera.position.set(0, 0, -150);
    this.camera.lookAt(this.scene.position);
  }

  setupLights() {
    const dirLight = new THREE.DirectionalLight(0x4682b4, 1); // steelblue
    dirLight.name = DIRECTIONAL_LIGHT_NAME;
    dirLight.position.set(120, 30, -200);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 10;
    this.scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xffaa55);
    spotLight.name = SPOT_LIGHT_NAME;
    spotLight.position.set(120, 30, 0);
    spotLight.castShadow = true;
    dirLight.shadow.camera.near = 10;
    this.scene.add(spotLight);

    const ambientLight = new THREE.AmbientLight(0xffaa55);
    this.scene.add(ambientLight);
  }

  setupUniforms() {
    this.colors = [
      [new THREE.Color(0xf5d4ff), new THREE.Color(0xce0fd6)],
      [new THREE.Color(0x003fbc), new THREE.Color(0x00ffff)],
      [new THREE.Color(0x880033), new THREE.Color(0xff00b3)],
      [new THREE.Color(0xf35f77), new THREE.Color(0x461cd8)],
      [new THREE.Color(0x9a0000), new THREE.Color(0x18b6ff)],
      [new THREE.Color(0x3da176), new THREE.Color(0xedfd54)],
    ]

    this.centerObjectPalette = 0
    this.centerObjectScale = new AnimationEffect({
      name: 'centerObjectScale',
      value: 1.0,
      speed: 10,
      minValue: 1.0,
      maxValue: 1.5,
    });
    this.wiggleIntensityX = new AnimationEffect({
      name: 'wiggleIntensityX',
      value: 0.0,
      speed: 10,
      minValue: 0.0,
      maxValue: 10.0,
    });
    this.wiggleIntensityY = new AnimationEffect({
      name: 'wiggleIntensityY',
      value: 0.0,
      speed: 10,
      minValue: 0.0,
      maxValue: 10.0,
    });
    this.normalIntensity = new AnimationEffect({
      name: 'normalIntensity',
      value: 1.0,
      speed: 10,
      minValue: 1.0,
      maxValue: 3.0,
    });
    this.skyboxPalette = 1
    this.skyboxColorIntensity = new AnimationEffect({
      name: 'normalIntensity',
      value: 0.0,
      speed: 10,
      minValue: 0.0,
      maxValue: 1.0,
    });

    // Define the shader uniforms
    this.uniforms = {
      u_time : {
        type : "f",
        value : 0.0
      },
      u_frame : {
        type : "f",
        value : 0.0
      },
      u_resolution : {
        type : "v2",
        value : new THREE.Vector2(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_mouse : {
        type : "v2",
        value : new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_texture : {
        type : "t",
        value : null
      },
      thickness: {
        type: 'f',
        value: 1.0
      },
      wiggleIntensityX: { type: 'f', value: this.wiggleIntensityX.value },
      wiggleIntensityY: { type: 'f', value: this.wiggleIntensityY.value },
      normalIntensity: { type: 'f', value: this.normalIntensity.value },
      startColor: { value: this.colors[this.centerObjectPalette][0] },
      endColor: { value: this.colors[this.centerObjectPalette][0] },
      skyboxStartColor: { value: this.colors[this.skyboxPalette][0] },
      skyboxEndColor: { value: this.colors[this.skyboxPalette][1]  },
      skyboxColorIntensity: { type: 'f', value: this.skyboxColorIntensity.value },
    };
  }

  updateUniforms() {
    const time = this.clock.getElapsedTime();
    this.uniforms.u_time.value = time;

    this.uniforms.wiggleIntensityX.value = this.wiggleIntensityX.update();
    this.uniforms.wiggleIntensityY.value = this.wiggleIntensityY.update();
    this.uniforms.normalIntensity.value = this.normalIntensity.update();
    this.uniforms.skyboxColorIntensity.value = this.skyboxColorIntensity.update();

    this.scene.getObjectByName(CUSTOM_MESH_NAME).scale.x = this.centerObjectScale.update();
    this.scene.getObjectByName(CUSTOM_MESH_NAME).scale.y = this.centerObjectScale.update();
    this.scene.getObjectByName(CUSTOM_MESH_NAME).scale.z = this.centerObjectScale.update();
  }

  setupHelpers() {
    const gridHelper = new THREE.GridHelper(200, 16);
    gridHelper.name = "Floor GridHelper";
    this.scene.add(gridHelper);

    // XYZ axes helper (XYZ axes are RGB colors, respectively)
    const axesHelper = new THREE.AxesHelper(75);
    axesHelper.name = "XYZ AzesHelper";
    this.scene.add(axesHelper);

    const dirLight = this.scene.getObjectByName(DIRECTIONAL_LIGHT_NAME);

    const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
    dirLightHelper.name = `${DIRECTIONAL_LIGHT_NAME} Helper`;
    this.scene.add(dirLightHelper);

    const dirLightCameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    dirLightCameraHelper.name = `${DIRECTIONAL_LIGHT_NAME} Shadow Camera Helper`;
    this.scene.add(dirLightCameraHelper);

    const spotLight = this.scene.getObjectByName(SPOT_LIGHT_NAME);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    spotLightHelper.name = `${SPOT_LIGHT_NAME} Helper`;
    this.scene.add(spotLightHelper);

    const spotLightCameraHelper = new THREE.CameraHelper(
      spotLight.shadow.camera
    );
    spotLightCameraHelper.name = `${SPOT_LIGHT_NAME} Shadow Camera Helper`;
    this.scene.add(spotLightCameraHelper);
  }

  setupRay() {
    this.raycaster = new THREE.Raycaster();
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;
    this.controls.autoRotate = false;
  }

  setupGUI() {
    const gui = new DAT.GUI();
    gui
      .add(this.camera.position, "x")
      .name("Camera X")
      .min(0)
      .max(100);
    gui
      .add(this.camera.position, "y")
      .name("Camera Y")
      .min(0)
      .max(100);
    gui
      .add(this.camera.position, "z")
      .name("Camera Z")
      .min(0)
      .max(100);
  }

  /**
   * Create an object that uses custom shaders.
   */
  addCustomMesh() {
    this.delta = 0;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexFade,
      fragmentShader: fragmentFade,
      uniforms: this.uniforms,
      side : THREE.DoubleSide,
            transparent : true,
            extensions : {
              derivatives : true
            }
    });

    const geometry = new THREE.SphereBufferGeometry(15, 100, 100);
    // const geometry = new THREE.TetrahedronBufferGeometry(15, );

    this.vertexDisplacement = new Float32Array(
      geometry.attributes.position.count
    );
    for (let i = 0; i < this.vertexDisplacement.length; i += 1) {
      this.vertexDisplacement[i] = Math.sin(i);
    }

    geometry.addAttribute(
      "vertexDisplacement",
      new THREE.BufferAttribute(this.vertexDisplacement, 1)
    );

    const customMesh = new THREE.Mesh(geometry, material);
    customMesh.name = CUSTOM_MESH_NAME;
    customMesh.position.set(0, 0, 0);
    this.scene.add(customMesh);
  }

  updateCustomMesh() {
    this.delta += 0.1;
    const customMesh = this.scene.getObjectByName(CUSTOM_MESH_NAME);
    customMesh.material.uniforms.delta.value = 0.5 + Math.sin(this.delta) * 0.5;
    for (let i = 0; i < this.vertexDisplacement.length; i += 1) {
      this.vertexDisplacement[i] = 0.5 + Math.sin(i + this.delta) * 0.25;
    }
    // attribute buffers are not refreshed automatically. To update custom
    // attributes we need to set the needsUpdate flag to true
    customMesh.geometry.attributes.vertexDisplacement.needsUpdate = true;
  }

  addSkybox(side) {
    const geometry = new THREE.CubeGeometry(side, side, side);
    // const material = new THREE.MeshLambertMaterial({ color: 0xfbbc05 });
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexSkybox,
      fragmentShader: fragmentSkybox,
      uniforms: this.uniforms,
      side: THREE.BackSide
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = "Skybox";
    cube.position.set(0, side / 4, 0);
    cube.rotation.speed = {
      x: new AnimationEffect({
        name: 'skyboxSpeedX',
        value: 0.0,
        speed: 10,
        minValue: 0.0,
        maxValue: 0.1,
      }),
      y: new AnimationEffect({
        name: 'skyboxSpeedY',
        value: 0.0,
        speed: 10,
        minValue: 0.0,
        maxValue: 0.1,
      }),
      z: new AnimationEffect({
        name: 'skyboxSpeedY',
        value: 0.0,
        speed: 10,
        minValue: 0.0,
        maxValue: 0.1,
      })
    }
    this.scene.add(cube);

    cube.cursor = "pointer";
  }

  updateSkybox() {
    const skybox = this.scene.getObjectByName('Skybox')
    skybox.rotation.x += skybox.rotation.speed.x.update()
    skybox.rotation.y += skybox.rotation.speed.y.update()
    skybox.rotation.z += skybox.rotation.speed.z.update()
  }

  /**
   * Add a particle system that uses the same texture for each particle.
   * The texture is asynchronously loaded.
   * Note: Three.js's TextureLoader does not support progress events.
   * @see https://threejs.org/docs/#api/en/loaders/TextureLoader
   */
  addParticleSystem(numParticles, particleSize, particleSpecs) {
    const geometry = new THREE.Geometry();
    const particles = Array(numParticles)
      .fill(particleSpecs)
      .map(makeParticle);
    geometry.vertices = particles;

    const onLoad = texture => {
      const material = new THREE.PointsMaterial({
        // alphaTest's default is 0 and the particles overlap. Any value > 0
        // prevents the particles from overlapping.
        alphaTest: 0.5,
        map: texture,
        size: particleSize,
        transparent: true,
      });

      const particleSystem = new THREE.Points(geometry, material);
      particleSystem.name = "Stars";
      particleSystem.position.set(-50, 50, -50);
      this.scene.add(particleSystem);

      particleSystem.cursor = "pointer";
    };

    const onProgress = undefined;

    const onError = event => {
      alert(`Impossible to load the texture ${star}`);
    };

    this.textureLoader.load(star, onLoad, onProgress, onError);
  }

  /**
   * Add a Three.js Group object to the scene.
   */
  addGroupObject(numBoxes, boxSpecs, behavior) {
    const group = new THREE.Group();
    group.name = "Group of Boxes";
    group.behavior = behavior;
    const { depth, height, spread, width } = boxSpecs;
    let groupGeometries = [
      new THREE.CylinderGeometry(width, 0.0, depth),
      new THREE.BoxGeometry(width, height, depth),
    ]

    function randomGeometry(type) {
      let geometry = null;
      const index = Math.floor(Math.random() * groupGeometries.length)
      console.log(index);
      // const geometry = new THREE.BoxGeometry(width, height, depth);
      switch (type) {
        case 0:
        default:
          return groupGeometries[index];
        case 1:
          return groupGeometries[0];
      }
    }

    // const meshes = Array(numBoxes)
    // for (var i = meshes.length - 1; i >= 0; i--) {
    //   meshes[i] = { geometry: randomGeometry(), spread: spread }
    // }
    let meshes = [];
    for (var i = 0; i < numBoxes; i++) {
      meshes.push({
        geometry: randomGeometry(boxSpecs.type),
        spread: spread
      })
    }
    console.log(meshes);
    meshes = meshes.map(makeMesh);
    console.log(meshes);

    for (const mesh of meshes) {
      mesh.velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random())
      group.add(mesh);
    }
    group.position.set(0, 0, 50);
    this.scene.add(group);

    group.cursor = "pointer";
  }

  updateGroupObject() {
    console.log('updateGroupObject');
    let group = this.scene.getObjectByName("Group of Boxes")
    if (group == undefined) { return; }
    group.children.forEach((child) => {
      switch (group.behavior) {
        case 0:
        default:
          // child.update()
          child.rotateX(0.05)
          // child.translateY(-2)
          child.position.x += child.velocity.x
          child.position.y += child.velocity.y
          child.position.z += child.velocity.z
          let max = 100
          if (Math.abs(child.position.x) > max) { child.velocity.x *= -1}
          if (Math.abs(child.position.y) > max) { child.velocity.y *= -1}
          if (Math.abs(child.position.z) > max) { child.velocity.z *= -1}
          break;
        case 1:
          child.rotateX(0.05)
          child.translateY(-2)
          break;

      }
    })
  }

  /**
   * Convert screen coordinates into Normalized Device Coordinates [-1, +1].
   * @see https://learnopengl.com/Getting-started/Coordinate-Systems
   */
  getNDCCoordinates(event, debug) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = event.clientX - offsetLeft;
    const x = (xRelativePx / clientWidth) * 2 - 1;

    const yRelativePx = event.clientY - offsetTop;
    const y = -(yRelativePx / clientHeight) * 2 + 1;

    if (debug) {
      const data = {
        "Screen Coords (px)": { x: event.screenX, y: event.screenY },
        "Canvas-Relative Coords (px)": { x: xRelativePx, y: yRelativePx },
        "NDC (adimensional)": { x, y },
      };
      console.table(data, ["x", "y"]);
    }
    return [x, y];
  }

  getScreenCoordinates(xNDC, yNDC) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = ((xNDC + 1) / 2) * clientWidth;
    const yRelativePx = -0.5 * (yNDC - 1) * clientHeight;
    const xScreen = xRelativePx + offsetLeft;
    const yScreen = yRelativePx + offsetTop;
    return [xScreen, yScreen];
  }
}

function makeParticle(d, i) {
  const particle = new THREE.Vector3();
  particle.x = THREE.Math.randFloatSpread(d.spread.x);
  particle.y = THREE.Math.randFloatSpread(d.spread.y);
  particle.z = THREE.Math.randFloatSpread(d.spread.z);
  return particle;
}

function makeMesh(d, i) {
  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
  });
  const mesh = new THREE.Mesh(d.geometry, material);
  mesh.name = `Box ${i} in GroupObject`;
  mesh.position.x = THREE.Math.randFloatSpread(d.spread.x);
  mesh.position.y = THREE.Math.randFloatSpread(d.spread.y);
  mesh.position.z = THREE.Math.randFloatSpread(d.spread.z);
  mesh.rotation.x = Math.random() * 360 * (Math.PI / 180);
  mesh.rotation.y = Math.random() * 360 * (Math.PI / 180);
  mesh.rotation.z = Math.random() * 360 * (Math.PI / 180);
  return mesh;
}
