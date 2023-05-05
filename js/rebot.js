/** @format */

import * as THREE from '../build/three.module.js';
import {FBXLoader} from '../three/jsm/loaders/FBXLoader.js';
import {GUI} from '../three/jsm/libs/dat.gui.module.js';
import {GLTFLoader} from '../three/jsm/loaders/GLTFLoader.js';
import {renderer, scene, camera, controls} from './scene.js';

var clock = new THREE.Clock();

var mixer = null;

var point = new THREE.PointLight(0xffffff);
scene.add(point);

var Directi = new THREE.DirectionalLight(0xffffff);
scene.add(Directi);

//地面网格
const grid = new THREE.GridHelper(1000, 100);
scene.add(grid);
// 加载光照贴图

var loader = new GLTFLoader();
var actions = [];
loader.load('../models/rotbot/robot.gltf', function (fbx) {
  scene.add(fbx.scene);
  console.log('fbx.scene: ', fbx);

  // mixer = new THREE.AnimationMixer(fbx.scene);
  //所有的动画数组

  // for (var i = 0; i < 8; i++) {
  //   actions[i] = mixer.clipAction(fbx.animations[i]);
  // }

  // actions[0].play();
});

function animate(time) {
  var time = clock.getDelta();
  if (mixer) {
    mixer.update(time);
  }
  TWEEN.update();
  // stats.update(); // 初始化stats后，需要在这里执行update方法才能实现fps实时监控
  renderer.render(scene, camera); // 最后需要将场景渲染出来，没有这句将什么都显示不了
  requestAnimationFrame(animate); // 这里利用浏览器API——requestAnimationFrame，每帧都进行渲染，执行renderer.render(...)方法
}
animate();
