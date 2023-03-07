import * as THREE from '../build/three.module.js'
import { FBXLoader } from '../jsm/loaders/FBXLoader.js'
import { GUI } from '../jsm/libs/dat.gui.module.js'
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js'
import { Reflector } from '../jsm/objects/Reflector.js'
import { renderer, scene, camera, controls } from './scene.js'

/**天空盒子 */
var path = '../img/6_sides-yun/' //设置路径
var directions = ['Left+X', 'Right-X', 'Up+Y', 'Down-Y', 'Front+Z', 'Back-Z'] //获取对象
var format = '.png' //格式
//创建盒子，并设置盒子的大小为( 5000, 5000, 5000 )
var skyGeometry = new THREE.BoxGeometry(100, 100, 100)
//设置盒子材质
var materialArray = []
for (var i = 0; i < 6; i++)
  materialArray.push(
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture(path + directions[i] + format), //将图片纹理贴上
      side: THREE.BackSide /*镜像翻转，如果设置镜像翻转，那么只会看到黑漆漆的
一片，因为你身处在盒子的内部，所以一定要设置镜像翻转。*/,
    })
  )
var skyMaterial = new THREE.MeshFaceMaterial(materialArray)
var skyBox = new THREE.Mesh(skyGeometry, skyMaterial) //创建一个完整的天空盒，填入几何模型和材质的参数
// skyBox.position.y += 10000

scene.add(skyBox) //在场景中加入天空盒

var granaryArr = []

// planeGeometry.faceVertexUvs[1] = planeGeometry.faceVertexUvs[0]
var textureLoader = new THREE.TextureLoader()
// 加载光照贴图
var textureLight = textureLoader.load(
  '../models/lightmap02/Inside_LightMap.png'
)
var texture = textureLoader.load('../models/JiGuangLou_Opacity/Grass.png')

// textureAO.wrapS = THREE.RepeatWrapping
// textureAO.wrapT = THREE.RepeatWrapping
// textureAO.repeat.x = 1

var loader = new GLTFLoader()

loader.load('../models/lightmap/lightmap.gltf', function (fbx) {
  scene.add(fbx.scene)
  console.log('fbx.scene: ', fbx.scene)
})

var fbxloader = new FBXLoader()

fbxloader.load(
  '../models/Opacity/A2_4_Building_Opacity/A2_4_Buiding_Opacity.FBX',
  function (fbx) {
    // scene.add(fbx)
    fbx.scale.set(0.01, 0.01, 0.01)
    fbx.position.set(0, 1, 0)
    console.log('fbx.scene: ', fbx)
  }
)

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
  // textureAO.flipY = false
  var pillar_xmesh = scene.getObjectByName('pillar_x')
  pillar_xmesh.geometry.attributes.uv = pillar_xmesh.geometry.attributes.uv2
  pillar_xmesh.material.lightMap = textureLight
  // pillar_xmesh.material.aoMap = textureAO

  var Floorxmesh = scene.getObjectByName('Floor')

  // textureEvn.mapping = THREE.EquirectangularReflectionMapping
  // textureEvn.encoding = THREE.sRGBEncoding
  // console.log('textureEvn.rotation: ', textureEvn.rotation)
  // textureEvn.rotation.x = Math.PI / 4
  // console.log('textureEvn.rotation: ', textureEvn.rotation)
  // Floorxmesh.material.roughness = 0
  // Floorxmesh.material.envMap = textureEvn
}

const sphereMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  map: texture,
})

const planegeometry = new THREE.PlaneBufferGeometry(18, 18)
const plane = new THREE.Mesh(planegeometry, sphereMaterial)

plane.rotateX(Math.PI / 2)
plane.position.y += 5
// scene.add(plane)

const mirror = new Reflector(planegeometry, {
  clipBias: 0.0003,
  textureWidth: 800,
  textureHeight: 800,
  recursion: 1,
  color: 0x444444,
  // side: THREE.DoubleSide,
  // map: texture,
  opacity: 0.5,
  transparent: true,
})
console.log(mirror)
mirror.rotateX(-Math.PI / 2)

// mirror.material.transparent = true
// mirror.material.uniforms.opacity.value = 0.2

mirror.position.y += 0.4
scene.add(mirror)

function animate(time) {
  TWEEN.update()
  // stats.update(); // 初始化stats后，需要在这里执行update方法才能实现fps实时监控
  renderer.render(scene, camera) // 最后需要将场景渲染出来，没有这句将什么都显示不了
  requestAnimationFrame(animate) // 这里利用浏览器API——requestAnimationFrame，每帧都进行渲染，执行renderer.render(...)方法
}
animate()
