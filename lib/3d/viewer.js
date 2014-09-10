if (!Detector.webgl) Detector.addGetWebGLMessage();

var container;
//var stats;
var camera, cameraControls, scene, renderer, camLight, sceneCenter, sceneRadius, settings;
var cross, model, oldCamY, lightYOffset, sceneCenter, sceneRadius, cl;
var fpsControls = false;
var helpTextChanged = false;
var clock = new THREE.Clock();

var trackballHelpText = '<table cellspacing="10">'
        +'<tr><td>Left mouse button</td><td>=</td><td>Move camera</td></tr>'
        +'<tr><td>Right mouse button</td><td>=</td><td>Move camera target</td></tr>'
        +'<tr><td>Mouse wheel/Middle mouse button</td><td>=</td><td>Zoom</td></tr>'
        +'<tr><td>H</td><td>=</td><td>Hide/Unhide Controls</td></tr></table>';
        
var flyHelpText = '<table cellspacing="10">'
        +'<tr><td>Mouse pointer</td><td>=</td><td>Look</td></tr>'
        +'<tr><td>Left mouse button/W/Up</td><td>=</td><td>Move forward</td></tr>'        
        +'<tr><td>Right mouse button/S/Down</td><td>=</td><td>Move backward</td></tr>'
        +'<tr><td>A/Left</td><td>=</td><td>Strafe left</td></tr>'
        +'<tr><td>D/Right</td><td>=</td><td>Strafe right</td></tr>'
        +'<tr><td>R</td><td>=</td><td>Fly up</td></tr>'
        +'<tr><td>F</td><td>=</td><td>Fly down</td></tr>'
        +'<tr><td>Q</td><td>=</td><td>Freeze/Unfreeze camera</td></tr>'
        +'<tr><td>H</td><td>=</td><td>Hide/Unhide Controls</td></tr></table>';

if (init()) {
    animate();
}

function loadSTL(modelUrl) {
    var loader = new THREE.STLLoader();
    loader.addEventListener('load', function(event) {
        var geometry = event.content;
        sceneCenter = geometry.boundingSphere.center;                
        sceneRadius = geometry.boundingSphere.radius;
        console.log(sceneCenter.x,',',sceneCenter.y,',',sceneCenter.z);        
        console.log(sceneRadius);        
        setupBestFit();
        var mesh = new THREE.Mesh(geometry);
        var material = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0x444444});        
        mesh.material = material;        
        scene.add(mesh);
        // if (typeof cl != 'undefined') {
        //     cl.hide();
        // }
        //hide loading indicator
        document.getElementsByClassName("loading")[0].style.display = 'none';



 	});
 	
 	if (typeof modelUrl === 'string') {
 	    loader.load(modelUrl);
    } else {
        if (modelUrl instanceof File) {
            loader.loadFromFile(modelUrl);
        }
    }
}

function loadOBJ(modelUrl) {
    var loader = new THREE.OBJLoader();
    /*loader.progressCallback = function(progress) {document.getElementById('title').innerHTML = 'Loading: ' + progress;    
    };*/
    
    var onLoad = function(object) {
        var material = new THREE.MeshPhongMaterial({color: 0xffffff, ambient: 0x444444});
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                model = child;                
                child.material = material;                
                sceneCenter = child.geometry.boundingSphere.center;                
                sceneRadius = child.geometry.boundingSphere.radius;
                setupBestFit();
            }
        });
        scene.add(object);
        // if (typeof cl != 'undefined') {
        //     cl.hide();
        // }
        //hide loading indicator
        document.getElementsByClassName("loading")[0].style.display = 'none';
        document.getElementById('3dcontainer').style.visibility = 'visible';


    }    
    
    if (typeof modelUrl === 'string') {
        loader.load(modelUrl, onLoad);
    } else {
        if (modelUrl instanceof File) {
            loader.loadFromFile(modelUrl, onLoad);
        }
    }
}

function loadOBJMTL(modelUrl, materialUrl) {
    var loader = new THREE.OBJMTLLoader();
	loader.load(modelUrl, materialUrl, function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                model = child;                
                sceneRadius = child.geometry.boundingSphere.radius;
                sceneCenter = child.geometry.boundingSphere.center;
                setupBestFit();
            }
        });	
        scene.add(object);
   	    //cl.hide();

        //hide loading indicator
        document.getElementsByClassName("loading")[0].style.display = 'none';
	});
}

function setupBestFit() {
    var halfFovInRad = 0.5 * (45 * Math.PI / 180); // fovy
    if (window.innerWidth < window.innerHeight) {
        var halfFovInRad = Math.atan((window.innerWidth / window.innerHeight) * Math.tan(halfFovInRad)); // fovx
    }
    var zDistance = sceneCenter.z + sceneRadius / Math.sin(halfFovInRad);
    camera.position.set(sceneCenter.x, sceneCenter.y, zDistance);
    camera.lookAt(sceneCenter);
    camera.near = sceneRadius / 100;
    camera.far = sceneRadius * 100;
    camera.updateProjectionMatrix();
}

function init() {

    // container = document.createElement('div');
	container = document.getElementById('3dcontainer');
	//document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10);
	
	// scene
	scene = new THREE.Scene();
        	
	// model
	id = getIdFromUrl();
    if (id == null) {
        var title = document.getElementById('title');
        title.innerHTML = "Click 'Load' to load a model from local disk";        
        
        initScene();
        initGUI(true);
        
        window.addEventListener('resize', onWindowResize, false);
        return true;
    } else { 
        if (isNumeric(id)) {
    	    // add load indicator
            // cl = new CanvasLoader('loader');
            // cl.setColor('#ffffff'); // default is '#000000'
            // cl.setShape('spiral'); // default is 'oval'
            // cl.setDiameter(80); // default is 40
            // cl.setDensity(80); // default is 40
            // cl.setRange(1); // default is 1.3
            // cl.setSpeed(2); // default is 2
            // cl.setFPS(25); // default is 24
            // cl.show(); // Hidden by default	 

            //hide loading indicator
            document.getElementsByClassName("loading")[0].style.display = 'block';
            	    
            // testing
            //loadOBJMTL('obj/hateriergrab/Hateriergrab.obj', 'obj/hateriergrab/Hateriergrab.mtl');
            //loadOBJ('obj/knabe_comp20.obj');
            //loadSTL('obj/Knabe_comp20_low.stl');        
            
            var modelUrl = "http://" + document.location.host + "/data/model/" + id;
            var materialUrl =  "http://" + document.location.host + "/data/model/material/" + id;
            
            // get meta data
            var request = new XMLHttpRequest();
            request.open('get', modelUrl  + '?meta=true', false);        
            request.send();
                    
            if (request.status === 200) {
                response = JSON.parse(request.responseText);
                // show meta info
                // var modelTitle = response.title;
                // var entityLink = response.connectedEntity;
                // if (modelTitle) {
                //     var title = document.getElementById('title');
                //     title.innerHTML = modelTitle;
                //     if (entityLink) {
                //         title.innerHTML = modelTitle
                //                 + '(<a href="http://crazyhorse.archaeologie.uni-koeln.de/arachne4/#entity/' + entityLink
                //                 + '" target="_blank">' + entityLink + '</a>)';
                //     }                
                // }
                // document.getElementById('data').innerHTML = '<b>Title: </b>' + modelTitle + '<br/>'
                //         +'<b>Modeller: </b>' + 'Max Mustermann<br/>'
                //         +'<b>License: </b>' + response.license + '</br>'
                //         +'<b>File format: </b>' + response.format + '<br/>'
                //         +'<b>Last modified: </b>' + 'some time ago';
                
                switch(response.format) {
                    case 'obj':     loadOBJ(modelUrl);
                                    break;
                    case 'objmtl':  loadOBJMTL(modelUrl, materialUrl);
                                    break;
                    case 'stl':     loadSTL(modelUrl);                                                            
                }        
            }
            
            initScene();
            initGUI();
            
            window.addEventListener('resize', onWindowResize, false);
            return true;        
        } else {
            return false;    
        }
    }
}

function initScene() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
	renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
	container.appendChild( renderer.domElement );

    cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
    cameraControls.rotateSpeed = 1.0;
	cameraControls.zoomSpeed = 1.0;
	cameraControls.panSpeed = 0.6;
	cameraControls.noZoom = false;
	cameraControls.noPan = false;
	cameraControls.staticMoving = false;
	cameraControls.dynamicDampingFactor = 0.15; 

    // lights
    var ambient = new THREE.AmbientLight(0x373737);
    scene.add(ambient);
    
    var directional = new THREE.DirectionalLight(0x373737);
    scene.add(directional);        
    
    camLight = new THREE.PointLight(0xc8c8c8);
    camLight.position = camera.position.clone();
    scene.add(camLight);      
    lightYOffset = 1;
}

function initGUI(isFileViewer) {
    // if (typeof isFileViewer === 'undefined') {
    //     isFileViewer = false;    
    // };    
        
    // var help = document.getElementById('help');
    // help.innerHTML = trackballHelpText;
    // help.addEventListener('transitionend', function () {
    //     if (helpTextChanged) {
    //         setHelpText();
    //         slideHelpIn();
    //     }
    // });        


    settings = {
        Mode: 'Trackball',
        FPS: false,
        Info: true,
        Help: true,
        Load: function () {
            document.getElementById('fileElem').click();           
        }
    }

    controlModeToggleBtn = document.getElementById('controlMode'); 
        
    //var gui = new dat.GUI();
    var changeController = function() {
        // Controller



        if (controlModeToggleBtn.value === "0") {
            settings.Mode = 'Fly';
            controlModeToggleBtn.value = "1";
            controlModeToggleBtn.innerHTML = '<span class="glyphicon glyphicon-retweet"></span> Trackball-Steuerung';
        } else {
            settings.Mode = 'Trackball';
            controlModeToggleBtn.value = "0";
            controlModeToggleBtn.innerHTML = '<span class="glyphicon glyphicon-retweet"></span> Flug-Steuerung';

        };

        cameraControls.removeEventHandlers();
        if (settings.Mode === 'Trackball') {
            setupBestFit();
            camera.up.set(0,1,0);
            cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
            cameraControls.rotateSpeed = 0.25;
			cameraControls.zoomSpeed = 1.0;
			cameraControls.panSpeed = 0.6;
			cameraControls.noZoom = false;
			cameraControls.noPan = false;
			cameraControls.staticMoving = false;
			cameraControls.dynamicDampingFactor = 0.15
			helpTextChanged = true;
			//slideHelpOut();
		} else {
            setupBestFit();
            camera.up.set(0,1,0);            
            cameraControls = new THREE.FirstPersonControls(camera, renderer.domElement);
            cameraControls.movementSpeed = sceneRadius / 6;
            cameraControls.lookSpeed = 0.1;
            cameraControls.lookVertical = true;
            helpTextChanged = true;
            //slideHelpOut();
        }
        render();    
    }

    
    controlModeToggleBtn.addEventListener('click',changeController,false)

    //gui.add(settings, "Mode", ['Trackball', 'Fly']).onChange(changeController);        
    
    // if (!isFileViewer) {    
    //     var toggleInfo = function() {
    //         if (settings.Info) {
    //             slideInfoIn();
    //         } else {
    //             slideInfoOut();            
    //         }       
    //     }        
    //     gui.add(settings, 'Info', settings.Info).onChange(toggleInfo);
    //     toggleInfo();       
    // } 
            
    // var toggleHelp = function() {
    //     if (settings.Help) {
    //         setHelpText();
    //         slideHelpIn();
    //     } else {
    //         slideHelpOut();            
    //     }       
    // }        
    // gui.add(settings, 'Help', settings.Help).onChange(toggleHelp);
    // toggleHelp();
    
    // if (isFileViewer) {
    //     // stats = new Stats();
    //     // stats.domElement.style.position = 'absolute';
    //     // stats.domElement.style.bottom = '0px';
    //     // stats.domElement.style.left = '-200px';
    //     // stats.domElement.style.zIndex = 100;
    //     // container.appendChild(stats.domElement);        
        
    //     var toggleFPSCounter = function() {
    //     if (settings.FPS) {
    //         slideFPSIn();
    //     } else {
    //         slideFPSOut();            
    //     }       
    //     }        
    //     gui.add(settings, 'FPS', settings.FPS).onChange(toggleFPSCounter);
    //     toggleFPSCounter();        
        
    //     gui.add(settings, 'Load');
    // }
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onFileChange(files) {
	var file = files[0];
    
    console.log(file);
    console.log(file.name + '-' + file.size + ' - ' + file.type);
    if (file.size > 50000000) {
    	alert("Files larger than 50MB are not supported.");
    	return;
    }
    
    if (endsWith(file.name, '.obj')) {
        loadOBJ(file);
    } else {
        if (endsWith(file.name, '.stl')) {
            loadSTL(file);
        } else {
            alert('Unsupported file format.');    
        }
    }     
}

function animate() {
	requestAnimationFrame(animate);
	cameraControls.update(clock.getDelta());
	
	camLight.position = camera.position.clone();
    camLight.position.y += lightYOffset;
    
    render();
}

function render() {
	renderer.render( scene, camera );
    // if (typeof stats !== 'undefined') {	
	   // stats.update();
    // }
}

function slideHelpIn() {
    var elem = document.getElementById('help');
	elem.style.transition = "right 0.2s ease-in-out 0s";
	elem.style.right = "0px";
}

function slideHelpOut() {
	var elem = document.getElementById('help');
	elem.style.transition = "right 0.2s ease-in-out 0s";
	elem.style.right = "-450px";
}

function slideInfoIn() {
    var elem = document.getElementById('data');
	elem.style.transition = "left 0.2s ease-in-out 0s";
	elem.style.left = "0px";
}

function slideInfoOut() {
	var elem = document.getElementById('data');
	elem.style.transition = "left 0.2s ease-in-out 0s";
	elem.style.left = "-500px";
}

// function slideFPSIn() {
//     var elem = stats.domElement;
// 	elem.style.transition = "left 0.2s ease-in-out 0s";
// 	elem.style.left = "0px";
// }

// function slideFPSOut() {
// 	var elem = stats.domElement;
// 	elem.style.transition = "left 0.2s ease-in-out 0s";
// 	elem.style.left = "-200px";
// }

function setHelpText() {
    if (settings.Mode === 'Trackball') {
        document.getElementById('help').innerHTML = trackballHelpText;
    } else {
        document.getElementById('help').innerHTML = flyHelpText;
    }
    helpTextChanged = false;
}

function getIdFromUrl() {
    var searchString = window.location.search.substring(1);
    var urlParams = searchString.split("&");
    var values;
    for (var i=0; i<urlParams.length; i++) {
        values = urlParams[i].split("=");
        if (values[0] == "id") {
            return decodeURIComponent(values[1]);        
        }    
    }   
    return null;
}

function isNumeric(value) {
    return !isNaN(value) && isFinite(value);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
