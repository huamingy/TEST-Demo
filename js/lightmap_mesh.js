import * as THREE from '../build/three.module.js'
import { FBXLoader } from '../jsm/loaders/FBXLoader.js'
import { GUI } from '../jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js'
import { renderer, scene, camera, controls } from './scene.js'

var granaryArr = []

// planeGeometry.faceVertexUvs[1] = planeGeometry.faceVertexUvs[0]
var textureLoader = new THREE.TextureLoader()
// 加载光照贴图
var textureLight = textureLoader.load(
  '../models/lightmap02/Inside_LightMap.png'
)
var textureAO = textureLoader.load('../models/lightmap/LightMap.png')

// textureAO.wrapS = THREE.RepeatWrapping
// textureAO.wrapT = THREE.RepeatWrapping
// textureAO.repeat.x = 1

var loader = new GLTFLoader()

loader.load('../models/lightmap/lightmap.gltf', function (fbx) {
  scene.add(fbx.scene)
  console.log('fbx.scene: ', fbx.scene)
  add()
})

function add() {
  textureAO.flipY = false
  var pillar_xmesh = scene.getObjectByName('墙面')

  pillar_xmesh.material.lightMap = textureAO
  textureAO.rotation.y = Math.PI

  // pillar_xmesh.material.map = textureLight
  pillar_xmesh.geometry.attributes.uv2 = pillar_xmesh.geometry.attributes.uv

  scene.getObjectByName('地面').receiveShadow = true
}

function animate(time) {
  TWEEN.update()
  // stats.update(); // 初始化stats后，需要在这里执行update方法才能实现fps实时监控
  renderer.render(scene, camera) // 最后需要将场景渲染出来，没有这句将什么都显示不了
  requestAnimationFrame(animate) // 这里利用浏览器API——requestAnimationFrame，每帧都进行渲染，执行renderer.render(...)方法
}
animate()
