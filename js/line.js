import * as THREE from '../build/three.module.js'
import { FBXLoader } from '../three/jsm/loaders/FBXLoader.js'
import { GUI } from '../three/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader.js'
import { renderer, scene, camera } from './scene.js'

var granaryArr = []

var Textureloader = new THREE.TextureLoader()
var map = Textureloader.load('../models/plane/A320/Wireframe.jpeg')

var loader = new FBXLoader()
// loader.load('../models/Pipe_CS/Pipe_CS2022-7-25.FBX', function (fbx) {
loader.load('../models/Cs_Line.FBX', function (fbx) {
  scene.add(fbx)

  var path = scene.getObjectByName('Rectangle001(CV_Curve_005)')
  path.material.color.set(0xffff00)
  console.log('linemesh ', path.geometry.attributes.position.array.length)
  var points_libe = path.geometry.attributes.position.array
  console.log('fbx: ', fbx)
  add(points_libe)
})

var textureload = new THREE.TextureLoader()
var textrue = textureload.load('../img/liquid_szw.jpg')

textrue.wrapS = THREE.RepeatWrapping
textrue.wrapT = THREE.RepeatWrapping
textrue.repeat.x = 1

setInterval(function () {
  textrue.offset.x += 0.01
})

var points = [],
  point2 = []

console.log('points: ', points)

function add(points_libe) {
  for (const n in points_libe) {
    points.push(points_libe[n])
  }

  //Convert the array of points_libe into vertices
  for (var i = 0; i < points.length; i += 3) {
    // if (i % 3 == 2) {
    var x = points[i]
    var z = -points[i + 1]
    var y = points[i + 2]
    point2.push(new THREE.Vector3(x, y, z))
    console.log(i)
    console.log('new THREE.Vector3(x, y, z): ', new THREE.Vector3(x, y, z))
    // }
  }
  console.log('points: ', points)
  console.log(point2)
  //Create a path from the points
  var path = new THREE.CatmullRomCurve3(point2)
  console.log('path: ', path)

  //Create the tube geometry from the path
  var geometry = new THREE.TubeGeometry(path, 100, 4, 20, false)
  console.log('geometry: ', geometry.extrusionSegments)
  //Basic material
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: textrue,
  })
  //Create a mesh
  var tube = new THREE.Mesh(geometry, material)
  //Add tube into the scene
  scene.add(tube)
}

function animate(time) {
  // TWEEN.update()
  // stats.update(); // 初始化stats后，需要在这里执行update方法才能实现fps实时监控
  renderer.render(scene, camera) // 最后需要将场景渲染出来，没有这句将什么都显示不了
  requestAnimationFrame(animate) // 这里利用浏览器API——requestAnimationFrame，每帧都进行渲染，执行renderer.render(...)方法
}
animate()
