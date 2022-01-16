// DIORAMA TOGGLE


AFRAME.registerComponent('cordillera-toggle', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {

    var firstWorld = document.getElementById('main-scene-wrapper')
    firstWorld.setAttribute('visible', 'false')
    var secondWorld = document.getElementById('second-scene-wrapper')
    secondWorld.setAttribute('visible', 'true')
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(775, 40, 0)



    var infoTitle = document.getElementById('info-title')
    var infoBird = document.getElementById('info-bird')
    var infoBird2 = document.getElementById('info-bird-2')
    infoTitle.setAttribute('text', 'value: Cordiellera')
    infoBird.setAttribute('text', 'value: Montane Racket Tail')
    infoBird2.setAttribute('text', 'value: White-browed jungle fly catcher')

    
    var cordExit = document.getElementById('cord-exit')
    cordExit.setAttribute('position', '0 -2 0')
    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});


AFRAME.registerComponent('benget-toggle', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {

    var firstWorld = document.getElementById('main-scene-wrapper')
    firstWorld.setAttribute('visible', 'false')
    var secondWorld = document.getElementById('second-scene-wrapper')
    secondWorld.setAttribute('visible', 'true')
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(775, 40, 0)
    
    var infoTitle = document.getElementById('info-title')
    var infoBird = document.getElementById('info-bird')
    var infoBird2 = document.getElementById('info-bird-2')
    infoTitle.setAttribute('text', 'value: Benget')
    infoBird.setAttribute('text', 'value: Luzon Highlands Scops Owl')
    infoBird2.setAttribute('text', 'value: Luzon Water Redstart')

  


    var bengetExit = document.getElementById('benget-exit')
    bengetExit.setAttribute('position', '0 -2 0')
  }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

AFRAME.registerComponent('mindoro-toggle', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {

    var firstWorld = document.getElementById('main-scene-wrapper')
    firstWorld.setAttribute('visible', 'false')
    var secondWorld = document.getElementById('second-scene-wrapper')
    secondWorld.setAttribute('visible', 'true')
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(775, 40, 0)


    var infoTitle = document.getElementById('info-title')
    var infoBird = document.getElementById('info-bird')
    var infoBird2 = document.getElementById('info-bird-2')
    infoTitle.setAttribute('text', 'value: `Mindoro')
    infoBird.setAttribute('text', 'value: Mindoro Imperial Pigeon')
    infoBird2.setAttribute('text', 'value: Mountain Shrike')


    var mindoroExit = document.getElementById('mindoro-exit')
    mindoroExit.setAttribute('position', '0 -2 0')
  }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

AFRAME.registerComponent('cagayan-toggle', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {

    var firstWorld = document.getElementById('main-scene-wrapper')
    firstWorld.setAttribute('visible', 'false')
    var secondWorld = document.getElementById('second-scene-wrapper')
    secondWorld.setAttribute('visible', 'true')
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(775, 40, 0)


    var infoTitle = document.getElementById('info-title')
    var infoBird = document.getElementById('info-bird')
    var infoBird2 = document.getElementById('info-bird-2')
    infoTitle.setAttribute('text', 'value: Cagayan')
    infoBird.setAttribute('text', 'value: Babler Luzon Stripe')
    infoBird2.setAttribute('text', 'value: Golden Crowned Babbler')


    var cagayanExit = document.getElementById('cagayan-exit')
    cagayanExit.setAttribute('position', '0 -2 0')
  }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});



AFRAME.registerComponent('exit-world-toggle', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {
    // Change Sky 
     var sky = document.getElementById('orbSky') 
     sky.setAttribute('src', '#sky-image') 
     var secondWorld = document.getElementById('second-scene-wrapper')
     secondWorld.setAttribute('visible', 'false')
    var firstWorld = document.getElementById('main-scene-wrapper')
    firstWorld.setAttribute('visible', 'true')
    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

// Reset Camera Positions 

AFRAME.registerComponent('exit-cord', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {
  
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(325, 24, -120)

    var cordExit = document.getElementById('cord-exit')
    cordExit.setAttribute('position', '0 -20 0')

    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

AFRAME.registerComponent('exit-benget', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {
  
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(158.358, 22, -230.971)

    var bengetExit = document.getElementById('benget-exit')
    bengetExit.setAttribute('position', '0 -20 0')
    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

AFRAME.registerComponent('exit-mindoro', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {
  
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(-81.696, 37.838, 111.167 )

    var bengetExit = document.getElementById('mindoro-exit')
    bengetExit.setAttribute('position', '0 -20 0')
    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

AFRAME.registerComponent('exit-cagayan', {
  init: function () {
    let el = this.el
    this.toggleSky = function () {
  
    var camera = document.getElementById('rig-2')
    camera.object3D.position.set(-342.755, 68.085, -42.556)

    var cagayanExit = document.getElementById('cagayan-exit')
    cagayanExit.setAttribute('position', '0 -20 0')
    }
    this.el.addEventListener('click', this.toggleSky)
  },
  remove: function() {
    this.el.removeEventListener('click', this.toggleSky)
  }
});

