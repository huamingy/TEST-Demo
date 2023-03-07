import * as THREE from '../build/three.module.js'

import { OrbitControls } from '../three/jsm/controls/OrbitControls.js'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '../three/jsm/loaders/FBXLoader.js'
import { RGBELoader } from '../three/jsm/loaders/RGBELoader.js'
import { RoughnessMipmapper } from '../three/jsm/utils/RoughnessMipmapper.js'

let camera, scene, renderer

init()
render()
var textureLoader = new THREE.TextureLoader()

function init() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  var width = window.innerWidth //窗口宽度
  var height = window.innerHeight //窗口高度
  var k = width / height //窗口宽高比

  camera = new THREE.PerspectiveCamera(45, k, 10, 500000)
  camera.position.set(-310 / 3, 410 / 3, 0) //设置相机位置

  scene = new THREE.Scene()

  const load = new THREE.TextureLoader()

  var point = new THREE.PointLight(0x999999) //点光源
  point.castShadow = true
  point.position.set(0, 5000, 30000) //点光源位置
  scene.add(point) //点光源添加到场景中

  const point1 = new THREE.PointLight(0x999999) //点光源
  point1.castShadow = true
  point1.position.set(0, 5000, -30000) //点光源位置
  scene.add(point1) //点光源添加到场景中

  const point2 = new THREE.PointLight(0x999999, 0.5) //点光源
  point2.castShadow = true
  point2.position.set(-550000, 100000, 0) //点光源位置
  scene.add(point2) //点光源添加到场景中

  var ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
  // var spotLight = new THREE.SpotLight(0xffffff, 0.5)
  // // spotLight.castShadow = true
  // spotLight.position.set(-30000, 8000, -25000)
  // scene.add(spotLight)

  const light = new THREE.DirectionalLight(0xffffff, 1) // 平行光，颜色为白色，强度为1
  light.position.set(-30000, 10000, -25000) // 设置灯源位置
  // light.target = Dev
  // light.castShadow = true // 允许生成阴影
  scene.add(light) // 添加到场景中

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

  renderer.setSize(width, height) //设置渲染区域尺寸
  renderer.setClearColor(0x000000, 1) //设置背景颜色
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.localClippingEnabled = true //剖切特定的模型

  container.appendChild(renderer.domElement)

  var loader = new GLTFLoader()

  loader.load('../models/JiGungLouGltf2023-3-6/JiGungLou.gltf', function (fbx) {
    scene.add(fbx.scene)
    Tree('SugarPalm')
    Tree('Tree01')
    Tree('Tree')
    // changeLigtmap('CementRoad')
    // changeLigtmap("PlayingField")//
    changeLigtmap('Road')
    // changeLigtmap("Square")//
    // changeLigtmap('SideWalk')
    // changeLigtmap('Grass')
  })

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render) // use if there is no animation loop
  window.addEventListener('resize', onWindowResize)
}

function changeLigtmap(name, img) {
  var mesh = scene.getChildByName(name)
  var lightmap = textureLoader.load(
    `../models/JiGungLouGltf2023-3-6/` + name + `LightMap.jpg`
  )
  var aoMap = textureLoader.load(
    `../models/JiGungLouGltf2023-3-6/` + name + `AO.jpg`
  )
  mesh.geometry.attributes.uv2 = mesh.geometry.attributes.uv
  // mesh.geometry.faceVertexUvs[1] = mesh.geometry.faceVertexUvs[0]
  // lightmap.flipY = false
  // aoMap.flipY = false

  mesh.material.lightMap = lightmap
  mesh.material.aoMap = aoMap
}

function Tree(name) {
  var mesh = scene.getChildByName(name)

  mesh.material.side = THREE.DoubleSide
  mesh.material.side = THREE.DoubleSide
  mesh.material.alphaTest = 0.1
  mesh.material.transparent = true
  mesh.material.vertexColors = false
  mesh.castShadow = true
  mesh.receiveShadow = true
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
