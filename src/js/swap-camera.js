// Camera Into End - Swap to Camera 2
  AFRAME.registerComponent('swap-camera', {
    init: function() {
      this.el.addEventListener("movingended", (e) => {
        console.log("moving ended")
      // Shut Yo Eyes! -- NOT ENOUGH TIME TO ANIMATE DUE TO DISABLE
        document.querySelector("#blink1").emit("blink-eye");



          //your code to be executed after 1 second
           // Disable Camera 1
          var firstCameraEl = document.querySelector('#camera-1');
          firstCameraEl.setAttribute('camera', 'active', false);


          // Activate Camera 2
          var secondCameraEl = document.querySelector('#camera-2');
          secondCameraEl.setAttribute('camera', 'active', true);
          // Open Eyes
          document.querySelector("#blink2").emit("blink-eyes2")

          






      })
    },
    tick: function() {
    }
  })

