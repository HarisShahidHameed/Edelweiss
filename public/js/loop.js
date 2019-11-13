




var loopCount = 0 ;
var ticks, clockDelta;


// hello



function loop() {



	loopCount += 1 ;

    clockDelta = clock.getDelta();


    requestAnimationFrame( loop );
    
    /*
    setTimeout( function() {

        requestAnimationFrame( loop );

    }, 1000 / 20 );
    */



    // temp
    // highRenderer.render( scene, camera );
    // console.log(  highRenderer.info.render.calls )

    
    
    if ( optimizer &&
         optimizer.params.level == 0 ) {

        highRenderer.render( scene, camera );

    } else {

        cheapRenderer.render( scene, camera );

    };

    
    
    



    // If performances are low,
    // reduce graphic quality to get at least 45FPS
    if ( loopCount > 60 &&
         optimizer ) {

        if ( clockDelta > optimizer.OPTFPS ) {

            optimizer.optimize( clockDelta );

        } else if ( clockDelta < optimizer.DEOPTFPS ) {

            optimizer.deOptimize( clockDelta );

        };

    };



    // UPDATE LOGIC

    if ( controler ) {

        ticks = Math.round( ( clockDelta / ( 1 / 60 ) ) * 2 );

        for ( let i = 0 ; i < ticks ; i++ ) {

            controler.update( clockDelta / ticks );

        };

    };



    // MISC UPDATES

    stats.update();
    if ( orbitControls ) orbitControls.update();

    // if ( controler ) controler.update( clockDelta );
    if ( mixer ) mixer.update( clockDelta );
    if ( charaAnim ) charaAnim.update( clockDelta );
    if ( dynamicItems ) dynamicItems.update( clockDelta );
    if ( input ) input.update( clockDelta );

    if ( cameraControl ) cameraControl.update( loopCount % 6 == 0 );
    if ( stamina ) stamina.update( loopCount % 10 == 0 );
    // if ( mapManager ) mapManager.update( loopCount % 10 == 0 );

};