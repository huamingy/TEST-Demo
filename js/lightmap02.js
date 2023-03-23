import * as THREE from '../build/three.module.js'
import { FBXLoader } from '../three/jsm/loaders/FBXLoader.js'
import { GUI } from '../three/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '../three/jsm/loaders/GLTFLoader.js'
import { renderer, scene, camera, controls } from './scene.js'

var granaryArr = []

var textureLoader = new THREE.TextureLoader()
// 加载光照贴图
var textureLight = textureLoader.load(
  '../models/lightmap02/Inside_LightMap.png'
)
var textureAO = textureLoader.load('../models/lightmap02/Inside_AO.png')

var textureEvn = textureLoader.load('../models/lightmap02/360.png')

var loader = new GLTFLoader()

loader.load('../models/lightmap02/lightmap02.gltf', function (fbx) {
  // fbx.position.set(15, 0, 0)
  // fbx.position.set(-400, -200, -800)
  // fbx.scale.set(100, 100, 100)
  scene.add(fbx.scene)
  console.log('fbx.scene: ', fbx.scene)
  add()
})

function add() {
  textureLight.flipY = false
  textureAO.flipY = false
  var pillar_xmesh = scene.getObjectByName('pillar_x')
  pillar_xmesh.geometry.attributes.uv = pillar_xmesh.geometry.attributes.uv2
  pillar_xmesh.material.lightMap = textureLight
  pillar_xmesh.material.aoMap = textureAO

  var Floorxmesh = scene.getObjectByName('Floor')

  textureEvn.mapping = THREE.EquirectangularReflectionMapping
  textureEvn.encoding = THREE.sRGBEncoding
  console.log('textureEvn.rotation: ', textureEvn.rotation)
  textureEvn.rotation.x = Math.PI / 4
  console.log('textureEvn.rotation: ', textureEvn.rotation)
  Floorxmesh.material.roughness = 0
  Floorxmesh.material.envMap = textureEvn
}
// planeGeometry.faceVertexUvs[1] = planeGeometry.faceVertexUvs[0]

function choose() {
  if (chooseMesh) {
    // camera.position.set(0, 0, 800)
    moveCaream(null, 0, 0, 800)
  }
  var Sx = event.clientX //鼠标单击位置横坐标
  var Sy = event.clientY //鼠标单击位置纵坐标
  //屏幕坐标转WebGL标准设备坐标
  var x = (Sx / window.innerWidth) * 2 - 1 //WebGL标准设备横坐标

  var y = -(Sy / window.innerHeight) * 2 + 1 //WebGL标准设备纵坐标
  //创建一个射线投射器`Raycaster`
  var raycaster = new THREE.Raycaster()
  //通过鼠标单击位置标准设备坐标和相机参数计算射线投射器`Raycaster`的射线属性.ray
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  //返回.intersectObjects()参数中射线选中的网格模型对象
  // 未选中对象返回空数组[],选中一个数组1个元素，选中两个数组两个元素
  var intersects = raycaster.intersectObjects(granaryArr)

  // console.log("射线投射器返回的对象 点point", intersects[0].point);
  // console.log("射线投射器的对象 几何体",intersects[0].object.geometry.vertices)
  // intersects.length大于0说明，说明选中了模型
  if (intersects.length > 0) {
    chooseMesh = intersects[0].object
    console.log('chooseMesh: ', chooseMesh)

    // camera.position.set(
    //   chooseMesh.position.x,
    //   chooseMesh.position.y,
    //   chooseMesh.position.z + 700
    // )

    moveCaream(chooseMesh.name, 0, 0, 350)
  }
}
// addEventListener('click', choose) // 监听窗口鼠标单击事件

function moveCaream(meshName, posx, posy, posz) {
  var FloorPosition
  if (meshName != null) {
    var havingmesh = scene.getObjectByName(meshName)

    FloorPosition = havingmesh.getWorldPosition()
    var a = FloorPosition.x + posx,
      b = FloorPosition.y + posy,
      c = FloorPosition.z + posz
  } else {
    FloorPosition = { x: 0, y: 0, z: 0 }
  }
  var p1 = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  }
  // 相机目标位置点
  // const p2 = { x: -1000, y: 1020, z: 4060 }
  var p2
  if (meshName != null) {
    p2 = {
      x: a,
      y: b,
      z: c,
    }
  } else {
    p2 = {
      x: 0,
      y: 0,
      z: 700,
    }
  }
  // 使用tween动画
  var tween = new TWEEN.Tween(p1)
    .to(p2, 6000)
    .easing(TWEEN.Easing.Quadratic.InOut)
  tween.onUpdate(() => {
    // 修改相机位置
    camera.position.set(p1.x, p1.y, p1.z)
    camera.lookAt(p1.x, p1.y, p1.z)
    controls.target.set(p1.x, p1.y, p1.z) // 确保镜头移动后，视觉中心还在圆点处
    controls.update()
  })
  // 开始动画
  tween.start()
}

function animate(time) {
  TWEEN.update()
  // stats.update(); // 初始化stats后，需要在这里执行update方法才能实现fps实时监控
  renderer.render(scene, camera) // 最后需要将场景渲染出来，没有这句将什么都显示不了
  requestAnimationFrame(animate) // 这里利用浏览器API——requestAnimationFrame，每帧都进行渲染，执行renderer.render(...)方法
}
animate()
