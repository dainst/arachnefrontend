/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;
	// this.invertVertical = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;
	
	this.noFly = false;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = -90;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}
    
    ////////////
	// internals

	var scope = this;    
        
	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	function onMouseDown( event ) {

		if ( scope.domElement !== document ) {

			scope.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( scope.activeLook ) {

			switch ( event.button ) {

				case 0: scope.moveForward = true; break;
				case 2: scope.moveBackward = true; break;

			}

		}

		scope.mouseDragOn = true;

	};

	function onMouseUp( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( scope.activeLook ) {

			switch ( event.button ) {

				case 0: scope.moveForward = false; break;
				case 2: scope.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	function onMouseMove( event ) {
        if ( scope.domElement === document ) {

			scope.mouseX = event.pageX - scope.viewHalfX;
			scope.mouseY = event.pageY - scope.viewHalfY;

		} else {

			scope.mouseX = event.pageX - scope.domElement.offsetLeft - scope.viewHalfX;
			scope.mouseY = event.pageY - scope.domElement.offsetTop - scope.viewHalfY;

		}

	};

	function onKeyDown( event ) {

		//event.preventDefault();
        
		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ scope.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ scope.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ scope.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ scope.moveRight = true; break;

			case 82: /*R*/ scope.moveUp = true; break;
			case 70: /*F*/ scope.moveDown = true; break;

			case 81: /*Q*/ scope.freeze = !scope.freeze; break;

		}

	};

	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ scope.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ scope.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ scope.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ scope.moveRight = false; break;

			case 82: /*R*/ scope.moveUp = false; break;
			case 70: /*F*/ scope.moveDown = false; break;

		}

	};

	this.update = function( delta ) {

		if ( this.freeze ) {

			return;

		}

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( !this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		if (this.noFly) {
		    targetPosition.y = position.y
		} else {
		    targetPosition.y = position.y + 100 * Math.cos( this.phi );
	    }
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
        
        this.object.lookAt( targetPosition );
	};

    this.updatePhi = function(angle) {
        var targetPosition = this.target,
			position = this.object.position;
        
        this.theta = angle;        
        
		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		if (this.noFly) {
		    targetPosition.y = position.y
		} else {
		    targetPosition.y = position.y + 100 * Math.cos( this.phi );
	    }
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );    
    }

    // modified 
    this.removeEventHandlers = function() {
        var domElement = this.domElement;
        domElement.removeEventListener('mousemove', onMouseMove);        
        domElement.removeEventListener('mousedown', onMouseDown);
        domElement.removeEventListener('mouseup', onMouseUp);        
        document.removeEventListener('keydown', onKeyDown);	    
	    document.removeEventListener('keyup', onKeyUp);
    }
    //    
    
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    
	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.handleResize();

};

THREE.FirstPersonControls.prototype = Object.create( THREE.EventDispatcher.prototype );