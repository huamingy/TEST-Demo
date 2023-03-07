import * as THREE from '../build/three.module.js'
import { OrbitControls } from '../jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(1000)
scene.add(axesHelper)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  10000
)
// camera.position.set(-20, 40, 90) // 设置相机的初始位置
camera.position.set(0, 2, 5) // 设置相机的初始位置

const renderer = new THREE.WebGLRenderer({ antialias: true }) //alpha: true  alpha：背景透明，antialias：抗锯齿

// renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
// renderer.autoClear = false
// renderer.gammaInput = true
// renderer.gammaOutput = true //inear转gamma
// renderer.toneMapping = THREE.ACESFilmicToneMapping

// renderer.setClearColor(0xdddddd, 1)
renderer.outputEncoding = THREE.sRGBEncoding

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement) // 加入body中，也可以加入任意元素里

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5) // 自然光，每个几何体的每个面都有光
const pointLight = new THREE.DirectionalLight(0xffffff, 1) // 点光源
pointLight.position.set(0, 100, 0) // 调整点光源位置
scene.add(ambientLight)
// scene.add(pointLight)

// controls.addEventListener('change', function () {}) // 添加事件
var controls = new OrbitControls(camera, renderer.domElement)
// 上下旋转范围
// controls.minPolarAngle = 0
// controls.maxPolarAngle = Math.PI/2;
// controls.maxPolarAngle = Math.PI / 2
// 启用或禁用摄像机平移
// controls.enablePan = false

//启用或禁用摄像机水平或垂直旋转
// controls.enableRotate = false

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

export { renderer, scene, camera, controls }
