import * as THREE from '../build/three.module.js'

import { OrbitControls } from '../three/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '../three/jsm/loaders/FBXLoader.js'
import { RGBELoader } from '../three/jsm/loaders/RGBELoader.js'
import { RoughnessMipmapper } from '../three/jsm/utils/RoughnessMipmapper.js'

let camera, scene, renderer

init()
render()

function init() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  )
  camera.position.set(0, 150, 0) //设置相机位置

  scene = new THREE.Scene()

  const load = new THREE.TextureLoader()

  let uniforms = {
    // fogDensity: { value: 0.01 },
    fogColor: { value: new THREE.Vector3(0, 0, 0) },
    time: { value: 1000 },
    uvScale: { value: new THREE.Vector2(3.0, 1.0) },
    texture1: { value: load.load('../img/cloud.png') },
    texture2: {
      // value: textureLoader.load("textures/carbon/Carbon_Normal.png"),
      value: load.load('../img/lavatile.jpg'),
    },
  }
  // uniforms['texture1'].value.repeat.x = 8
  uniforms['texture1'].value.wrapS = uniforms['texture1'].value.wrapT =
    THREE.RepeatWraping

  uniforms['texture2'].value.wrapS = uniforms['texture2'].value.wrapT =
    THREE.RepeatWraping

  // const size = 0.65

  const material = new THREE.ShaderMaterial({
    transparent: true,
    opacity: 0.1,

    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  })

  const ambient = new THREE.AmbientLight(0xffffff, 0.6) //环境光源
  scene.add(ambient)
  // const point = new THREE.PointLight(0xffffff) //点光源
  // point.position.set(60, 300, 10) //点光源位置
  //     // // 通过add方法插入场景中，不插入的话，渲染的时候不会获取光源的信息进行光照计算
  // scene.add(point) //点光源添加到场景中

  const point1 = new THREE.PointLight(0xffffff) //点光源
  point1.position.set(-60, 320, 60) //点光源位置
  // scene.add(point1) //点光源添加到场景中

  var Direction = new THREE.DirectionalLight(0xffffff)
  Direction.position.set(60, 200, 0)
  // scene.add(Direction)

  const hemiLight = new THREE.HemisphereLight(0x0e189, 0x0e189)
  // const hemiLight = new THREE.HemisphereLight(0x00008B, 0x666666)
  hemiLight.position.set(0, 120, 0)
  // scene.add(hemiLight)

  // 方向光2
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(-400, -200, -300)
  // scene.add(directionalLight)

  const pointligh = new THREE.PointLight(0xffffff)
  pointligh.position.set(50, 100, 0)
  // scene.add(pointligh)

  // const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff)
  // hemiLight.position.set(0, 100, 0)
  // scene.add(hemiLight)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true,
  })

  // var renderer = new THREE.WebGLRenderer({
  //   antialias: true,
  // })
  // renderer.setSize(width, height) //设置渲染区域尺寸
  renderer.toneMappingExposure = 1
  // // renderer.shadowMap.enabled = true
  renderer.autoClear = false
  // renderer.gammaInput = true
  // renderer.gammaOutput = true //inear转gamma
  // renderer.toneMapping = THREE.ACESFilmicToneMapping
  // renderer.toneMappingExposure = 1
  // renderer.setClearColor(0xdddddd, 1)
  // renderer.outputEncoding = THREE.sRGBEncoding

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.setClearColor('#444444', 1.0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  var textureLoader = new THREE.TextureLoader()
  // var texture = textureLoader.load(
  //   './models/Pipe_CS/Pipe_CS/4K特效烟雾 (5)_00528.png'
  // )
  var texturealpha = textureLoader.load(
    '../models/CS_OpacityScene/wind01_alpha_wind01.png'
  )

  var loader = new FBXLoader()

  loader.load('../models/Pipe_CS/sphere.FBX', function (fbx) {
    scene.add(fbx)
    console.log('fbx: ', fbx)
    scene.getObjectByName('Sphere001').material = material

    // textmesh.material.map=texture
    // textmesh.material = new THREE.MeshPhongMaterial({
    // map:texttrue,
    // // alpha:texturealpha

    // })

    setInterval(() => {
      // texttrueCW.offset.x -= 0.008
      // texttrue.offset.x -= 0.008
      // texturealpha.offset.x -= 0.008
    })
    //     textmesh.material.onBeforeCompile = function (shader) {
    //       shader.uniforms.rimColor = uniforms.rimColor
    //       shader.uniforms.rimPower = uniforms.rimPower
    //       shader.fragmentShader = `
    //  uniform  vec3 rimColor;
    //  uniform  float rimPower;
    // ${shader.fragmentShader.replace(
    //   '#include <dithering fragment>',
    //   '#include <dithering_fragment>\n\tfloat dotNV= 1.0-saturate(dot(normal, geometry.viewDir) );\n\tgl_FragColor.rgb += rimPower*dotNV*rimColor;'
    // )}`
    //     }
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render) // use if there is no animation loop
  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  render()
}

//

function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}
export { renderer }
