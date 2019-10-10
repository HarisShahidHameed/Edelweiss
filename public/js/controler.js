
function Controler( player ) {


    // TEMPORARY FEATURE CONTROL
    datGUI.add( GUIControler, 'gliding', true ).onChange( toggleGliding );
    datGUI.add( GUIControler, 'infinityJump', true ).onChange( toggleInfinityJump );
    datGUI.add( GUIControler, 'dash', true ).onChange( toggleDash );

    function toggleGliding( bool ) {
        permission.gliding = bool ;

        console.log(permission)
    };

    function toggleInfinityJump( bool ) {
        permission.infinityJump = bool ;
    };

    function toggleDash( bool ) {
        permission.dash = bool ;
    };



    // climbing movements
    var xCollision ;

    // vert movements
    var speedUp = 0 ;
    var yCollision;

    // horiz movements
    var SPEED = 0.04 ;
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, SPEED );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var requestedMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;
    var inertia = 0 ;
    var runCounter = 0;

    // climbing movements
    var CLIMBSPEED = 0.03 ;
    var CLIMBVEC = new THREE.Vector3( 0, CLIMBSPEED, 0 );
    var AXISX = new THREE.Vector3( 1, 0, 0 );
    var AXISZ = new THREE.Vector3( 0, 0, 1 );

    // player state
    var state = {
        isFlying: false,
        isGliding: false,
        isClimbing: false
    };

    // player permission
    var permission = {
        gliding: true,
        infinityJump: true,
        dash: true
    };

    const GLIDINGTIME = 250 ;
    var glidingCount = 0 ;

    // hold the side on which the player contacts
    // a wall. "left", "right", "up" or "down".
    // undefined if no wall
    var contactDirection; 


    function update( delta ) {



        //////////////////////
        ///  GLIDING STATE
        //////////////////////

        if ( state.isFlying && input.params.isSpacePressed ) {

            glidingCount += delta * 1000 ;

            if ( glidingCount >= GLIDINGTIME ) {
                state.isGliding = true ;
            };

        } else {

            glidingCount = 0 ;
            state.isGliding = false ;

        };



       
        




        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////

        // Acceleration
        if ( ( input.moveKeys.length > 0 ) && !state.isClimbing ) {



            ////////////////////////
            ////   MOVEMENT ANGLE
            ////////////////////////

            if ( currentDirection != requestedDirection ) {

                // get the difference in radians between the current orientation
                // and the requested one
                angleToApply = utils.toPiRange( requestedDirection - currentDirection ) ;

                // finish the tweening if the turn is almost finished
                if ( angleToApply < 0.01 && angleToApply > -0.01 ) {

                    currentDirection = requestedDirection ;
                    HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

                // No tweening in case of U-turn, + inertia reset
                } else if ( angleToApply > 2.8 || angleToApply < -2.8 ) {

                    // slow down before instead of U-turn if fast in the air
                    if ( state.isFlying && inertia > 0.15 ) {

                        inertia = inertia * 0.7 ;

                    } else {

                        currentDirection = requestedDirection ;
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

                        // reset inertia
                        inertia = 0 ;

                    };


                // Normal tweening
                } else {

                    if ( state.isFlying ) {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / 20) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / 20 );

                    } else {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / 4) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / 4 );

                    };

                };

            } else {

                angleToApply = 0 ;

            };



            /////////////
            //  INERTIA
            /////////////

            // increment the counter allowing to run
            if ( input.params.isSpacePressed ) {
                runCounter += delta * 1000 ;
            } else {
                runCounter = 0;
            };

            if ( state.isFlying ) { // in air

                // Keep the inertia if it a running jump
                if ( inertia > 1 ) {

                    // test for change of direction while in the air
                    if ( angleToApply > 0.1 || angleToApply < -0.1 ) {
                        inertia = inertia >= 1 ? inertia - 0.05 : inertia + 0.05 ;
                    };

                } else {
                    
                    inertia = inertia >= 1 ? 1 : inertia + 0.03 ;

                };
                
            } else { // on ground

                if ( runCounter > 350 ) {
                    inertia = inertia >= 1.8 ? 1.8 : inertia + 0.1 ;
                } else {
                    inertia = inertia >= 1 ? 1 : inertia + 0.06 ;
                };

            };




        //////////////////////////
        ///  CLIMBING MOVEMENTS
        //////////////////////////

        } else if ( ( input.moveKeys.length > 0 ) && state.isClimbing ) {

            runCounter = 0 ;
            inertia = 0 ;

            switch ( contactDirection ) {

                case 'up' :
                    climb( AXISZ, requestedDirection );
                    break;

                case 'down' :
                    climb( AXISZ, requestedDirection );
                    break;

                case 'left' :
                    climb( AXISX, requestedDirection );
                    break;

                case 'right' :
                    climb( AXISX, requestedDirection );
                    break;

            };

            /*
            var CLIMBSPEED = 0.03 ;
            var CLIMBVEC = new THREE.Vector3( 0, CLIMBSPEED, 0 );
            var AXISX = new THREE.Vector3( 1, 0, 0 );
            var AXISZ = new THREE.Vector3( 0, 0, 1 );
            */

            function climb( axis, angle ) {

                CLIMBVEC.set( 0, -CLIMBSPEED, 0 );
                CLIMBVEC.applyAxisAngle( axis, angle );

                console.log( CLIMBVEC );

                player.position.addScaledVector( CLIMBVEC, 1 );

            };

            



        //////////////////
        ///  SLOWDOWN
        //////////////////

        } else {

            // reset the counter allowing to run
            runCounter = 0 ;

            if ( state.isFlying ) {

                // We set a minimal speed when gliding
                if ( state.isGliding ) {

                    inertia = Math.max( inertia, 0.2 );

                } else {

                    // slowdown is slower in the air
                    inertia = inertia / 1.12 ;

                };

            } else { // on ground

                inertia = inertia / 1.6 ;

            };

        };


        player.position.addScaledVector( HORIZMOVEVECT, inertia );






        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        // atlas compute the position of the player according
        // to the horizontal obstacles in the scene.
        yCollision = atlas.collidePlayerGrounds() ;

        // There is a collision with the ground
        if ( yCollision.point != undefined ) {

            speedUp = 0 ;

            // Player stands on the ground
            if ( yCollision.direction == 'down' ) {

                state.isFlying = false ;
                player.position.y = yCollision.point ;

            } else { // Player hit a roof

                // It's important to position the player slightly out
                // of collision with the roof, or at next frame a new
                // collision with the roof will be detected and speedUp
                // will be set again to 0, which would stick the player
                // to the roof
                player.position.y = yCollision.point - 0.05 ;

            };


        // There is no collision with the ground
        } else {

            state.isFlying = true ;

            if ( state.isGliding ) {

                // set gliding fall speed
                speedUp = -0.1 ;

            } else if ( state.isClimbing ) {

                speedUp = 0 ;

            } else {

                // Normal gravity
                speedUp -= 0.06 ;
                speedUp = Math.max( Math.min( speedUp, 1.25 ), -2.3 );

            };

        };




        player.position.y += ( speedUp * 0.1 ) ;




        /////////////////////////////////////////////
        ///  CLIMBING SETTING AND WALL COLLISIONS
        /////////////////////////////////////////////


        xCollision = atlas.collidePlayerWalls( currentDirection );

        contactDirection = xCollision.direction ;


        if ( xCollision.xPoint ) {
            player.position.x = xCollision.xPoint ;
        };

        if ( xCollision.zPoint ) {
            player.position.z = xCollision.zPoint ;
        };

        if ( xCollision.majorWallType ) {

            
            switch (xCollision.majorWallType) {


                case 'wall-slip' :

                    // set slipping speed
                    if ( speedUp < 0 &&
                         player.position.y > xCollision.minHeight - (atlas.PLAYERHEIGHT / 2) &&
                         player.position.y < xCollision.maxHeight - (atlas.PLAYERHEIGHT * 0.95) ) {

                        speedUp = -0.25 ;
                    };
                    setClimbingState( false );
                    break;



                case 'wall-fall' :

                    // make the player fall
                    if ( player.position.y > xCollision.minHeight - (atlas.PLAYERHEIGHT / 2) &&
                         player.position.y < xCollision.maxHeight - (atlas.PLAYERHEIGHT * 0.95) ) {

                        // compute desired fall direction
                        if ( contactDirection == 'left' ) {

                            currentDirection = Math.PI / 2 ;
                            HORIZMOVEVECT.set( SPEED, 0, 0 );
                        
                        } else if ( contactDirection == 'right' ) {

                            currentDirection = -Math.PI / 2 ;
                            HORIZMOVEVECT.set( -SPEED, 0, 0 );

                        } else if ( contactDirection == 'up' ) {

                            currentDirection = 0 ;
                            HORIZMOVEVECT.set( 0, 0, SPEED );

                        } else if ( contactDirection == 'down' ) {

                            currentDirection = Math.PI ;
                            HORIZMOVEVECT.set( 0, 0, -SPEED );

                        };

                        inertia = 1 ;
                        speedUp = -0.35 ;
                        // player is pushed out of contact with the wall,
                        // so not the fall cannot be avoided
                        player.position.addScaledVector( HORIZMOVEVECT, 1.5 );
                    };
                    setClimbingState( false );
                    break;



                case 'wall-easy' :
                    setClimbingState( true );
                    break;



                case 'wall-medium' :
                    setClimbingState( true );
                    break;



                case 'wall-hard' :
                    setClimbingState( true );
                    break;

            };

        } else {

            setClimbingState( false );

        };



        function setClimbingState( isClimbing ) {

            if ( isClimbing ) {

                state.isClimbing = true ;
                state.isFlying = false ;

            } else {

                state.isClimbing = false ;

            };

        };


    };







    // Sent here by input module when the user released space bar
    function spaceInput() {

        if ( !state.isGliding &&
             ( !permission.infinityJump && !state.isFlying || 
             permission.infinityJump ) ) {

            player.position.y += 0.1 ;

            // This conditional to make sure that the player is climbing
            // or slipping along a wall
            if (state.isFlying) {

                switch ( contactDirection ) {

                    case 'right' :
                        currentDirection = -Math.PI / 2 ;
                        HORIZMOVEVECT.set( -SPEED, 0, 0 );
                        setJump();
                        break;

                    case 'left' :
                        currentDirection = Math.PI / 2 ;
                        HORIZMOVEVECT.set( SPEED, 0, 0 );
                        setJump();
                        break;

                    case 'up' :
                        currentDirection = 0 ;
                        HORIZMOVEVECT.set( 0, 0, SPEED );
                        setJump();
                        break;

                    case 'down' :
                        currentDirection = Math.PI ;
                        HORIZMOVEVECT.set( 0, 0, -SPEED );
                        setJump();
                        break;

                    default :
                        speedUp = 1.25 ;
                        break;

                };

            } else {

                speedUp = 1.25 ;
            
            };
            

            function setJump() {
                inertia = 1.6 ;
                speedUp = 0.95 ;
            };


        };


    };








    function setMoveAngle( requestMove, requestedDir ) {

        requestedMove = requestMove ;

        if ( typeof requestedDir != 'undefined' ) {

            requestedDirection = requestedDir ;

        };

    };



    return {
        update,
        spaceInput,
        setMoveAngle
    };

};