	var width = 400;
	var height = 272;
	var e = window.event;
	var mouseX, mouseY;
	//mouse position in canvas
	var jmouseX = 0;
	var jmouseY = 0;
	document.onmousemove = function(e) {
	    mouseX = e.clientX;
	    mouseY = e.clientY;
	};

	var ballX = 600;
	var ballY = 0;
	var diffx = 0;
	var diffy = 0;
	var targetX = 0;
	var targetY = 0;
	var trail = [];
	var easing = 0.1;
	var trailAmount = 10;
	var spotSize = 5;
	var onScene = 0;
	var timer = 0;
	var mousePos;
	var s2Timer = 0;
	var s0Timer = 0;
	//scene3 vars
	//particle system
	var pSystem;
	var fallingParticleSize = 10;
	var colorPalette = [
	    { r: 254, g: 0, b: 4 },
	    { r: 0, g: 234, b: 27 },
	    { r: 0, g: 112, b: 252 },
	    { r: 246, g: 249, b: 0 },
	    { r: 251, g: 132, b: 0 },
	    { r: 0, g: 241, b: 224 },
	    { r: 0, g: 223, b: 92 }
	]


	var thecanvas, thecontext;
	var container;
	var camera, scene, renderer;
	var geometry, material, mesh;
	var zPosition;


	function init() {
	    thecanvas = document.getElementById('thecanvas');
	    thecanvas.setAttribute('width', width);
	    thecanvas.setAttribute('height', height);
	    thecontext = thecanvas.getContext('2d');
	    // thecontext.fillRect(0, 0, 300, 300);
	    pSystem = new ParticleSystem({ x: 0, y: 0 }, thecontext);

	    if (!Detector.webgl) {
	        Detector.addGetWebGLMessage();
	        return false;
	    }
	    renderer = new THREE.WebGLRenderer();
	    if (renderer.extensions.get('ANGLE_instanced_arrays') === false) {
	        document.getElementById("notSupported").style.display = "";
	        return false;
	    }
	    container = document.createElement('div');
	    container.setAttribute('id', 'threeScene');
	    document.body.appendChild(container);
	    camera = new THREE.PerspectiveCamera(50, width / height, 1, 5000);
	    zPosition = 1000;
	    camera.position.z = zPosition;
	    scene = new THREE.Scene();
	    geometry = new THREE.InstancedBufferGeometry();
	    geometry.copy(new THREE.CircleBufferGeometry(1, 6));
	    var particleCount = 75000;
	    var translateArray = new Float32Array(particleCount * 3);
	    for (var i = 0, i3 = 0, l = particleCount; i < l; i++, i3 += 3) {
	        translateArray[i3 + 0] = Math.random() * 2 - 1;
	        translateArray[i3 + 1] = Math.random() * 2 - 1;
	        translateArray[i3 + 2] = Math.random() * 2 - 1;
	    }
	    geometry.addAttribute("translate", new THREE.InstancedBufferAttribute(translateArray, 3, 1));


	    material = new THREE.RawShaderMaterial({
	        uniforms: {
	            map: { value: new THREE.TextureLoader().load("assets/circle2.png") },
	            time: { value: 0.0 },
	            mousex: { value: 1.0 },
	            mousey: { value: 1.0 }
	        },
	        vertexShader: document.getElementById('vshader').textContent,
	        fragmentShader: document.getElementById('fshader').textContent,
	        depthTest: true,
	        depthWrite: true
	    });
	    mesh = new THREE.Mesh(geometry, material);
	    mesh.scale.set(500, 500, 500);
	    scene.add(mesh);
	    renderer.setClearColor(0xffffff);
	    renderer.setPixelRatio(window.devicePixelRatio);
	    renderer.setSize(width, height);
	    container.appendChild(renderer.domElement);

	    // window.addEventListener('resize', onWindowResize, false);
	    return true;
	}

	// function onWindowResize(event) {
	//     camera.aspect = window.innerWidth / window.innerHeight;
	//     camera.updateProjectionMatrix();
	//     renderer.setSize(window.innerWidth, window.innerHeight);
	// }


	window.addEventListener('keydown',
	    function(evt) {
	        if (evt.key == 'ArrowUp') {
	            zPosition = 2000;
	        }
	        if (evt.key == 'ArrowDown') {
	            zPosition = 200;
	        }
	        if (evt.key == 'ArrowLeft') {
	            zPosition += 200;
	        }
	        if (evt.key == 'ArrowRight') {
	            zPosition -= 200;
	        }

	    });


	function animate() {
	    requestAnimationFrame(animate);
	    render();
	    thecanvas.addEventListener('mousemove', function(evt) {
	        jmouseX = evt.clientX;
	        jmouseY = evt.clientY;

	    });
	    thecontext.clearRect(0, 0, width, height);
	    thecontext.fillRect(0, 0, width, height);
	    diffx = targetX - ballX; //what`s the different between mouse and the circle
	    diffy = targetY - ballY;
	    ballX = ballX + easing * diffx; //everytime catches a little bit more of the diff
	    ballY = ballY + easing * diffy;
	    var pos = { x: ballX, y: ballY };

	    trail.push(pos);
	    targetX = jmouseX;
	    targetY = jmouseY;
	    if (trail.length > trailAmount) {
	        trail.splice(0, 1);
	    }
	    mousePos = {};
	    mousePos.x = jmouseX;
	    mousePos.y = jmouseY;

	    switch (onScene) {
	        case 0:
	            //do nothing

	            break;
	        case 1:
	            var introEllipseX = width - width / 6;
	            var introEllipseY = height - width / 6;
	            ellipse(thecontext, introEllipseX, introEllipseY, s0Timer, s0Timer);
	            if (s0Timer < spotSize * trailAmount) {
	                s0Timer += 0.1;
	            }
	            break;
	        case 2:
	            console.log("Scene 2");
	            s0Timer = 0;
	            s2Timer = 0;
	            drawTrail(thecontext, trail, spotSize);
	            break;
	        case 3:
	            console.log("Scene 3");
	            s0Timer = 0;
	            var s2Trail = [];
	            var staticPos = { x: width - width / 6, y: width / 6 };
	            for (var i = 0; i < trail.length; i++) {
	                s2Trail.push(staticPos);
	            }
	            if (s2Timer < 100) {
	                var newSize = spotSize * Math.abs(Math.sin(0.1 * timer));
	                drawTrail(thecontext, trail, newSize);
	                var oppSize = spotSize * Math.abs(Math.cos(0.1 * timer));
	                drawTrail(thecontext, s2Trail, oppSize);
	            } else if (s2Timer >= 100) {
	                var newOppSize = spotSize * Math.abs(Math.cos(0.03 * timer));
	                drawTrail(thecontext, s2Trail, newOppSize);
	            }
	            s2Timer++;
	            break;
	        case 4:
	            console.log("Scene 4");
	            var s2Trail = [];
	            // var staticPos = createVector(width - 150, 150);
	            var staticPos = { x: width - width / 6, y: width / 6 };
	            for (var i = 0; i < trail.length; i++) {
	                s2Trail.push(staticPos);
	            }
	            var newOppSize = spotSize * Math.abs(Math.cos(0.03 * timer));
	            drawTrail(thecontext, s2Trail, newOppSize);
	            s2Timer = 0;
	            var s4Col = { r: 255, g: 255, b: 255 };
	            var s4Acc = { x: -0.05, y: 0.05 };
	            pSystem.addParticle(mousePos, s4Col,s4Acc);
	            pSystem.run();
	            break;
	        case 5:
	            console.log("Scene 5");
	            s2Timer = 0;
	            var s5Acc = {x: 0.05, y: -0.05 };
	            var s5Col = { r: 255, g: 255, b: 255 };
	            pSystem.addParticle(mousePos, s5Col,s5Acc);
	            pSystem.run();
	            break;
	        case 6:
	            console.log("Scene 6");
	            s2Timer = 0;
	            var s6Acc = { x:  0.1*Math.random(), y: -0.1*Math.random() };
	            var s6Col = { r: Math.floor(255 * Math.random()) + 70, g: Math.floor(255 * Math.random()), b: Math.floor(255 * Math.random()) + 70 };
	            var randomPos = { x: Math.floor(width * Math.random()), y: Math.floor(height * Math.random()) }
	            pSystem.addParticle(mousePos, s6Col,s6Acc);
	            pSystem.run();
	            break;

	    }
	    // var newSize = spotSize * Math.abs(Math.sin(0.1 * timer));
	    //  drawTrail(thecontext, trail, spotSize);
	    timer += 1;

	}


	function render() {
	    var time = performance.now() * 0.0005;
	    camera.position.z = zPosition;
	    material.uniforms.time.value = time;
	    material.uniforms.mousex.value = mouseX / width;
	    material.uniforms.mousey.value = mouseY / height;
	    mesh.rotation.x = time * 0.2;
	    mesh.rotation.y = time * 0.4;
	    renderer.render(scene, camera);
	}
	if (init()) {
	    animate();
	}

	function drawTrail(ctx, trail, size) {
	    for (var i = 0; i < trail.length; i++) {
	        ctx.save();
	        ctx.fillStyle = 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',' + 0.5 + ')';
	        ctx.beginPath();
	        ctx.ellipse(trail[i].x, trail[i].y, size * (i + 1), size * (i + 1), 45 * Math.PI / 180, 0, 2 * Math.PI);
	        ctx.fill();
	        ctx.restore();
	    }
	}

	function ellipse(ctx, _x, _y, size, size) {
	    ctx.save();
	    ctx.fillStyle = 'rgb(' + 255 + ',' + 255 + ',' + 255 + ')';
	    ctx.beginPath();
	    ctx.ellipse(_x, _y, size, size, 45 * Math.PI / 180, 0, 2 * Math.PI);
	    ctx.fill();
	    ctx.restore();
	}
	//0 = 48; 1=49...9=57, a=65
	window.addEventListener('keydown', function(evt) {
	    if (evt.keyCode == 48) {
	        console.log("typing 0");
	        onScene = 0;
	    } else if (evt.keyCode == 49) {
	        console.log("typing 1");
	        onScene = 1;
	    } else if (evt.keyCode == 50) {
	        console.log("typing 2");
	        onScene = 2;
	    } else if (evt.keyCode == 51) {
	        console.log("typing 3");
	        onScene = 3;
	    } else if (evt.keyCode == 52) {
	        console.log("typing 4");
	        onScene = 4;
	    } else if (evt.keyCode == 53) {
	        console.log("typing 5");
	        onScene = 5;
	    } else if (evt.keyCode == 54) {
	        console.log("typing 6");
	        onScene = 6;
	    } else if (evt.keyCode == 55) {
	        console.log("typing 7");
	        $('#intro').removeClass('show').addClass('hide');
	    } else if (evt.keyCode == 56) {
	        console.log("typing 8");
	        $('#intro').removeClass('hide').addClass('show');
	    }

	}, true)