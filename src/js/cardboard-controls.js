AFRAME.registerComponent('cardboard-controls', {
init: function () {
  this.moving = false;
  this.handlers = {
    cardboard: evt => {        
      AFRAME.scenes[0].xrSession.addEventListener('selectstart', () => {          
        this.moving = true;
      });
      AFRAME.scenes[0].xrSession.addEventListener('selectend', () => {
        this.moving = false;
      });
    }
  }
  if (this.el.sceneEl.is('vr-mode')) this.handlers.cardboard();
  window.addEventListener('enter-vr', this.handlers.cardboard);
},
isVelocityActive: function () {
  return this.moving;
},
getVelocityDelta: function () {              
  return new THREE.Vector3(0, 0, -1);
}
});
