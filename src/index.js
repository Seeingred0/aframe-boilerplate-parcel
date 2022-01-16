// require('aframe');

var startExperienteBtn = document.getElementById('start_experience');

startExperienteBtn.onclick = function(){
    document.getElementById('container').outerHTML = '';
    document.getElementsByTagName('a-scene')[0].style.zIndex = 'auto';

    var blinkOpener = document.getElementById('blink')

    // var sound = document.getElementById('soundintro')
    // sound.components.sound.playSound(); 
    
};

var scene = document.querySelector("a-scene");
if (scene.hasLoaded) {
        run();
    } else {
        scene.addEventListener("loaded", run);
    }

    function run () {
        var loading = document.querySelector('.title3')
        var circles = document.querySelector('.container1')
        loading.style.visibility = 'hidden';
        circles.style.visibility = 'hidden'

var btn = document.querySelector('.button')  
        btn.style.visibility = 'visible'


}