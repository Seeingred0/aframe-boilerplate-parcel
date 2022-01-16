AFRAME.registerComponent("start-button", {
    init: function() {

      var camera = document.querySelector("#rig-wrapper");
      console.log(camera)

      document.querySelector("#start-fly").addEventListener("click", e => 
      {
        if (camera.components.alongpath) {
          camera.components.alongpath.reset();
        } else {
          camera.setAttribute("alongpath", "curve", "#track2");
          camera.setAttribute("alongpath", "loop", "false");
          camera.setAttribute("alongpath", "dur", "10000");
          camera.setAttribute("alongpath", "rotate", "true");
        }
        var wrapper = document.querySelector("#start-info-wrapper")
        wrapper.setAttribute("visible", "false")
      });
  
    }
  });