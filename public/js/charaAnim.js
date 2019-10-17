

function CharaAnim( player ) {


	var glider;

    const group = player.charaGroup ;


    // this variable stock the state waiting to be played
    // after ground hitting
    var waitingState ;



    // This is called when atlas finished loading all the assets.
    // It configures every action.
    function initActions() {

    	/// TIMESCALE

	    actions.gliderAction.setEffectiveTimeScale( 3 );
	    actions.run.setEffectiveTimeScale( 3 );
	    actions.climbUp.setEffectiveTimeScale( 3 );
        actions.climbDown.setEffectiveTimeScale( 3 );
        actions.climbLeft.setEffectiveTimeScale( 3 );
        actions.climbRight.setEffectiveTimeScale( 3 );
        actions.hitGround.setEffectiveTimeScale( 3 );


        /// CLAMP WHEN FINISHED

        setLoopOnce( actions.jumbRise );
        setLoopOnce( actions.hitGround );

        setLoopOnce( actions.dashUp );
        setLoopOnce( actions.dashDown );
        setLoopOnce( actions.dashLeft );
        setLoopOnce( actions.dashRight );
        setLoopOnce( actions.dashDownLeft );
        setLoopOnce( actions.dashDownRight );

    };


    function setLoopOnce( action ) {
    	action.clampWhenFinished = true ;
    	action.loop = THREE.LoopOnce ;
    };





    // This object stores the weight factor of each
    // climbing animation. It is updated when the user moves
    // while climbing by the function setClimbBalance.
    var climbDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };


    var dashDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };


    var currentState = 'idleGround' ;
    /*

    idleGround
    idleClimb

    runningSlow
	runningFast

    climbing
    slipping
    
    gliding
    jumping
    falling
    hittingGround

    dashing
    chargingDash

    haulingDown
    haulingUp
    switchInward
    switchOutward
    pullingUnder

    */



    
    /*
    actionsToFadeIn and actionsToFadeOut store
    objects like this :
	{
	actionName,
	targetWeight,
	fadeSpeed (between 0 and 1)
	}
	This is used in the update function to tween the
	weight of actions
    */
    var actionsToFadeIn = [];
    var actionsToFadeOut = [];





    function update( delta ) {



    	// handle the hittingGround action, that make averything
    	// standby until it's played
    	if ( currentState == 'hittingGround' &&
    		 actions.hitGround.time > 0.7 ) {

    		if ( waitingState ) {
    			setState( waitingState );
    		};

    	};



    	if ( actionsToFadeIn.length > 0 ) {

    		// console.log(actionsToFadeIn)

    		actionsToFadeIn.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight + action.fadeSpeed
	    		);

	    		if ( actions[ action.actionName ].weight >=
	    			 action.targetWeight ) {

	    			actions[ action.actionName ].setEffectiveWeight( action.targetWeight );

	    			actionsToFadeIn.splice( actionsToFadeIn.indexOf( action ), 1 );
	    		
	    		};

    		});

    	};


    	if ( actionsToFadeOut.length > 0 ) {

    		// console.log(actionsToFadeOut)

    		actionsToFadeOut.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight - action.fadeSpeed
	    		);

	    		if ( actions[ action.actionName ].weight <= 0 ) {

	    			actions[ action.actionName ].setEffectiveWeight( 0 );

	    			actionsToFadeOut.splice( actionsToFadeOut.indexOf( action ), 1 );

	    		};

    		});

    	};

    };




    function setFadeIn( actionName, targetWeight, fadeSpeed ) {

    	actionsToFadeIn.push({
			actionName,
			targetWeight,
			fadeSpeed
		});

    	// Delete the starting action from the fadeOut list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeOut.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeOut.splice( i, 1 );
			};

		});

    };



    function setFadeOut( actionName, fadeSpeed ) {

    	actionsToFadeOut.push({
			actionName,
			fadeSpeed
		});

		// Delete the starting action from the fadeIn list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeIn.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeIn.splice( i, 1 );
			};

		});

    };






    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };







    function setState( newState ) {


    	if ( currentState == 'hittingGround' &&
    		 actions.hitGround.time <= 0.7 ) {

    		waitingState = newState ;

    		return
    	};


    	if ( currentState != newState ) {


    		// set fade-in
    		switch ( newState ) {

    			case 'runningSlow' :
    				setFadeIn( 'run', 1, 0.1 );
    				break;

    			case 'idleGround' :
    				setFadeIn( 'idle', 1, 0.1 );
    				break;

    			case 'idleClimb' :
    				setFadeIn( 'climbIdle', 1, 1 );
    				break;

    			case 'jumping' :
    				setFadeIn( 'jumbRise', 1, 1 );
    				break;

    			case 'falling' :
    				setFadeIn( 'fall', 1, 0.1 );
    				break;

    			case 'gliding' :
    				glider.visible = true ;
    				setFadeIn( 'glide', 1, 1 );
    				break;

    			case 'chargingDash' :
    				setFadeIn( 'chargeDash', 1, 1 );
    				break;

    			case 'hittingGround' :
    				actions.hitGround.reset();
    				setFadeIn( 'hitGround', 1, 0.1 );
    				break;

    		};




    		// set fade-out
    		switch ( currentState ) {

    			case 'idleGround' :
    				actions.idle.reset();
    				setFadeOut( 'idle', 0.1 );
    				break;

    			case 'idleClimb' :
    				setFadeOut( 'climbIdle', 1 );
    				break;

    			case 'runningSlow' :
    				setFadeOut( 'run', 0.1 );
    				break;

    			case 'jumping' :
    				setFadeOut( 'jumbRise', 0.2 );
    				break;

    			case 'falling' :
    				setFadeOut( 'fall', 1 );
    				break;

    			case 'gliding' :
    				glider.visible = false ;
    				setFadeOut( 'glide', 1 );
    				break;

    			case 'chargingDash' :
    				setFadeOut( 'chargeDash', 0.2 );
    				break;

    			case 'climbing' :
    				setFadeOut( 'climbUp', 0.1 );
    				setFadeOut( 'climbDown', 0.1 );
    				setFadeOut( 'climbLeft', 0.1 );
    				setFadeOut( 'climbRight', 0.1 );
    				break;

    			case 'dashing' :
    				setFadeOut( 'dashUp', 0.1 );
    				setFadeOut( 'dashDown', 0.1 );
    				setFadeOut( 'dashLeft', 0.1 );
    				setFadeOut( 'dashRight', 0.1 );
    				setFadeOut( 'dashDownLeft', 0.1 );
    				setFadeOut( 'dashDownRight', 0.1 );
    				break;

    			case 'hittingGround' :
    				setFadeOut( 'hitGround', 0.1 );
    				break;

    		};



    		currentState = newState ;

    	};

    };




    // This function combute the direction, to call a passed
    // value attribution funcion with the right arguments.
    function callWithDirection( fn, faceDirection ) {


    	switch ( faceDirection ) {

            case 'up' :
                fn( 'up', Math.PI );
                fn( 'down', 0 );
                fn( 'left', -Math.PI / 2 );
                fn( 'right', Math.PI / 2 );
                break;

            case 'down' :
                fn( 'up', Math.PI );
                fn( 'down', 0 );
                fn( 'left', Math.PI / 2 );
                fn( 'right', -Math.PI / 2 );
                break;

            case 'left' : 
                fn( 'up', -Math.PI / 2 );
                fn( 'down', Math.PI / 2 );
                fn( 'left', 0 );
                fn( 'right', Math.PI );
                break;

            case 'right' :
                fn( 'up', Math.PI / 2 );
                fn( 'down', -Math.PI / 2 );
                fn( 'left', Math.PI );
                fn( 'right', 0 );
                break;

        };

    };






    // Here we need to compute the climbing direction from the
    // arguments, to balance climbing-up, climbing-right etc..
    function setClimbBalance( faceDirection, moveDirection ) {


        if ( currentState == 'climbing' ) {

        	callWithDirection( setClimbDirection, faceDirection );

        	actions.climbUp.setEffectiveWeight( climbDirectionPowers.up );
	        actions.climbDown.setEffectiveWeight( climbDirectionPowers.down );
	        actions.climbLeft.setEffectiveWeight( climbDirectionPowers.left );
	        actions.climbRight.setEffectiveWeight( climbDirectionPowers.right );

        };


        // Attribute a value between 0 and 1 to a climbing animation according
        // to the difference between the requested angle and the target angle
        // that would make this action 100% played
        function setClimbDirection( directionName, target ) {

            climbDirectionPowers[ directionName ] = Math.max(
                    ( 1 -
                    ( Math.abs( utils.minDiffRadians( target, moveDirection ) ) /
                    (Math.PI / 2) )
                    )
            , 0 );

        };

    };





    function setDashBalance( faceDirection, moveDirection ) {

    	if ( currentState != 'dashing' ) {

        	callWithDirection( setDashDirection, faceDirection );

        	// This part plays the set of upper dash animations
        	if ( dashDirectionPowers.up >= 0 ) {

        		actions.dashUp.reset();
		        actions.dashLeft.reset();
		        actions.dashRight.reset();

        		actions.dashUp.setEffectiveWeight( dashDirectionPowers.up );
		        actions.dashLeft.setEffectiveWeight( dashDirectionPowers.left );
		        actions.dashRight.setEffectiveWeight( dashDirectionPowers.right );

        	// This part plays the bottom dash animations
        	} else {

        		actions.dashUp.reset();
		        actions.dashDownLeft.reset();
		        actions.dashDownRight.reset();

        		actions.dashUp.setEffectiveWeight( dashDirectionPowers.up );
		        actions.dashDownLeft.setEffectiveWeight( dashDirectionPowers.left );
		        actions.dashDownRight.setEffectiveWeight( dashDirectionPowers.right );

        	};

        	

        };


        function setDashDirection( directionName, target ) {

        	dashDirectionPowers[ directionName ] = Math.max(
                    ( 1 -
                    ( Math.abs( utils.minDiffRadians( target, moveDirection ) ) /
                    (Math.PI / 2) )
                    )
            , 0 );

        };

    };








    function setGlider( gliderMesh ) {
    	glider = gliderMesh ;
    	glider.visible = false ;
    };



    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    
    function climb( faceDirection, moveDirection ) {
    	setState( 'climbing' );
        setClimbBalance( faceDirection, moveDirection );
    };


    function dash( faceDirection, moveDirection ) {
        setDashBalance( faceDirection, moveDirection );
        // We set the dashing state after, because we want
        // the dash balance to be set only when the dashing
        // animation is not played
        setState( 'dashing' );
    };


    function runSlow() {
    	setState( 'runningSlow' ); // could use inertia value to apply weight ?
    };


    function runFast() {
    	setState( 'runningFast' );
    };


    function idleClimb() {
    	setState( 'idleClimb' );
    };


    function idleGround() {
    	setState( 'idleGround' );
    };


    function glide() {
        setState('gliding');
    };


    function chargeDash() {
        setState('chargingDash');
    };


    function jump() {
        setState('jumping');
    };


    function fall() {
        setState('falling');
    };


    function slip() {
        setState('slipping');
    };


    function haulDown() {
        setState('haulingDown');
    };


    function haulUp() {
        setState('haulingUp');
    };


    function switchOutward() {
        setState('switchingOutward');
    };


    function switchInward() {
        setState('switchingInward');
    };


    function pullUnder() {
        setState('pullingUnder');
    };


    function hitGround( power ) {
    	
    	if ( power < 1 ) {
    		groundHit = false ;
    		setState('hittingGround');
    	} else {
    		console.log('play death')
    	};

    };


    


    return {
    	setGlider,
    	initActions,
    	update,
        setCharaRot,
        group,
        hitGround,
        runSlow,
        runFast,
        idleClimb,
        climb,
        idleGround,
        glide,
        dash,
        chargeDash,
        jump,
        fall,
        slip,
        haulDown,
        haulUp,
        switchOutward,
        switchInward,
        pullUnder
    };

};