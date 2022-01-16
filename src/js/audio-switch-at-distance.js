AFRAME.registerComponent('audio-switch-at-distance', {
    schema: {
      target: {type: 'selector', default: '[camera]'},
      distance: {type: 'number', default: 5.0},
      playing: {type: 'boolean', default: false}
    },  
    init: function () {        
      this.tick = AFRAME.utils.throttleTick(this.checkDist, 200, this);
    },
    checkDist: function () {
      let myPos = this.el.object3D.position;
      let targetPos = this.data.target.object3D.position
      let distanceTo = myPos.distanceTo(targetPos);    
      if (distanceTo < this.data.distance && !this.data.playing) {  
        this.el.components.sound.playSound();
        this.data.playing = true;
      } else if(distanceTo >= this.data.distance && this.data.playing) {      
        this.el.components.sound.pauseSound();
        this.data.playing = false;

      }
    }
  });