
import map from './assets/MAP.glb'

import lowTrees from './assets/low-trees.glb'
import smallRocks from './assets/SmallRocks.glb'
import goldRocks from './assets/GoldRocks.glb'
import cliff from './assets/clifftest3.glb'
import navmesh from './assets/nav.glb'
import water from './assets/images/Water_001_COLOR.jpeg'
import flowerModel from './assets/flower.glb'
import butterfly from './assets/butterfly.glb'
import birdFlock from './assets/bird-flock.glb'
import treeGroup from './assets/tree-group.glb'
import treesingle from './assets/treeSolo.glb'
import Vine from './assets/vine.glb'
// import rainbowTree from './assets/rainbow.glb'
import Tree from './assets/tree.glb'
import PalmTree from './assets/HurricanePalmTree-smalltexture.glb'

import shipWreck from './assets/shipwreck.glb'
import fence from './assets/fence.glb'
import sign from './assets/sign.glb'
import SamarSign from './assets/samar-sign.glb'

import skyimage from './assets/images/sky-test.jpg'


import blackImage from './assets/images/black-image.jpg'
import secondSky from './assets/images/sky-diorama.jpg'
import PortalTexture from './assets/images/portal-texture.jpg'
import backgroundTexture from './assets/images/background.png'


import bird1 from './assets/bird-1.glb'
import owl from './assets/owl.glb'
import mindoroPigeon from './assets/mindoro-pigeon.glb'
import mindoroShrike from './assets/shrike.glb'

import dioramaScene from './assets/diorama-test.glb'




function modelLoad() {


    let mapModel = document.getElementById('map-model');
    mapModel.setAttribute('src', map)

    let treeModel = document.getElementById('tree-model');
    treeModel.setAttribute('src', Tree)

    let palmTree = document.getElementById('palm-tree-wind');
    palmTree.setAttribute('src', PalmTree)

    let skyImage = document.getElementById('sky-image');
    skyImage.setAttribute('src', skyimage)

    let backgroundImage = document.getElementById('background-image');
    backgroundImage.setAttribute('src', backgroundTexture)

    let cliffModel = document.getElementById('cliff-model');
    cliffModel.setAttribute('src', cliff)

    let waterImg = document.getElementById('water')
    waterImg.setAttribute('src', water)

    let TreeGroup = document.getElementById('tree-group-model')
    TreeGroup.setAttribute('src', treeGroup)

    let TreeSingle = document.getElementById('tree-single-model')
    TreeSingle.setAttribute('src', treesingle)

    // let rainBow = document.getElementById('rainbow-model')
    // rainBow.setAttribute('src', rainbowTree)

    let shipwreck = document.getElementById('shipwreck-model')
    shipwreck.setAttribute('src', shipWreck)
   
    let lowTreesModel = document.getElementById('low-trees-model');
    lowTreesModel.setAttribute('src', lowTrees);

    let smallRocksModel = document.getElementById('small-rocks-model');
    smallRocksModel.setAttribute('src', smallRocks);

    let goldRocksModel = document.getElementById('gold-rocks-model');
    goldRocksModel.setAttribute('src', goldRocks);

    let fenceModel = document.getElementById('fence-model');
    fenceModel.setAttribute('src', fence);

    let signModel = document.getElementById('sign-model');
    signModel.setAttribute('src', sign);

    let SamarSignModel = document.getElementById('samar-sign-model');
    SamarSignModel.setAttribute('src', SamarSign);

    let navMesh = document.getElementById('nav-mesh-model')
    navMesh.setAttribute('src', navmesh)   

    let blackImg = document.getElementById('black-image')
    blackImg.setAttribute('src', blackImage)

    let butterflyModel = document.getElementById('butterfly-model')
    butterflyModel.setAttribute('src', butterfly)

    let birdFlockModel = document.getElementById('bird-flock')
    birdFlockModel.setAttribute('src', birdFlock)

    let flower = document.getElementById('flower-model')
    flower.setAttribute('src', flowerModel)

    let vine = document.getElementById('vine-model')
    vine.setAttribute('src', Vine)

    let secondSkyImage = document.getElementById('second-sky')
    secondSkyImage.setAttribute('src', secondSky)

    let portalTexture = document.getElementById('portal-texture')
    portalTexture.setAttribute('src', PortalTexture)

    // Load Birds
    let birdModel = document.getElementById('bird-model')
    birdModel.setAttribute('src', bird1)

    let owlModel = document.getElementById('owl-model')
    owlModel.setAttribute('src', owl)

    let pigeonModel = document.getElementById('pigeon-model')
    pigeonModel.setAttribute('src', mindoroPigeon)

    let shrikeModel = document.getElementById('shrike-model')
    shrikeModel.setAttribute('src', mindoroShrike)


    // Load Diorama

    let dioramaModel = document.getElementById('diorama-model')
    dioramaModel.setAttribute('src', dioramaScene)

  








}

// Call the Function
// component();
modelLoad();