(function (window) {
    const StateMachine = window.StateMachine;
    
    // use the opspark namespace //
    const opspark = window.opspark = window.opspark || {};
    
    // create the gamey namespace //
    const gamey = opspark.gamey = opspark.gamey || {};
    
    const createjs = window.createjs;
        
    gamey.make = function (updateables = []) {
        const
            app = {},
            messenjah = opspark.factory.dispatcher();
        
        /*
         * Used to hold the wrapper function returned from
         * calling createjs.Ticker.on('tick', app.update);
         */
        let tickerHandler;
        
        var fsm = new StateMachine({
            init: 'lobby',
            transitions: [
              { name: 'play', from: 'lobby',  to: 'playing' },
              { name: 'pause', from: 'playing', to: 'paused' },
              { name: 'quit', from: 'paused', to: 'lobby' },
              { name: 'unpause', from: 'paused', to: 'playing' },
              { name: 'end', from: ['playing', 'paused'], to: 'lobby' },
            //   { name: 'reset', from: [ 'B', 'C', 'D' ], to: 'A' }
            ],
            methods: {
              onPlay: function() { 
                  console.log('on play...');
                  tickerHandler = createjs.Ticker.on('tick', app.update); 
                  messenjah.dispatch({ type: 'stateChange', from: 'lobby', to: 'playing'});
              },
              onPause: function() { 
                  console.log('on pause...'); 
                  createjs.Ticker.off('tick', tickerHandler); 
                  messenjah.dispatch({ type: 'stateChange',from: 'playing', to: 'paused'}); 
              },
              onQuit: function() {
                  console.log('on quit...');
                  messenjah.dispatch({ type: 'stateChange', from: 'paused', to: 'lobby'});
              },
              onUnpause: function() { 
                  console.log('on unpause...');
                  messenjah.dispatch({ type: 'stateChange', from: 'paused', to: 'playing'});
              },
              onEnd: function() { 
                  console.log('on end...');
                  createjs.Ticker.off('tick', tickerHandler);
                  messenjah.dispatch({ type: 'stateChange', from: 'playing', to: 'lobby'}); 
              }
            }
          });
        
        const 
            canvas = document.getElementById('canvas'), 
            stage = new createjs.Stage(canvas);
            Object.assign(app, {
                canvas: canvas,
                stage: stage,
                view: new createjs.Container(),
                
                play: function() { fsm.play(); },
                pause: function() { fsm.pause(); },
                quit: function() { fsm.quit(); },
                unpause: function() { fsm.unpause(); },
                end: function() { fsm.end(); },
                
                addUpdateable: function(updateable) {
                    updateables.push(updateable);
                    return app;
                },
                
                removeUpdateable: function(updateable) {
                    const index = updateables.indexOf(updateable);
                    if (index !== -1) {
                        updateables.splice(index, 1);
                    }
                    return app;
                },
                
                update: function(event) {
                    stage.update();
                    for (var i = 0; i < updateables.length; i++) {
                        updateables[i].update();
                    }
                },
                
                getNumberUpdateables() {
                    return updateables.length;
                },
            },
            messenjah);
        
        window.addEventListener('resize', onResize, false);
        function onResize(event) {
            setSize();
            app.update(event);
        }
        
        function setSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // call set size once to set the initial canvas dimensions //
        setSize();
        
        app.stage.addChild(app.view);
        createjs.Ticker.framerate = 60;
        // createjs.Ticker.on('tick', app.update);
        
        // createjs.Touch.enable(_canvas, true, false);
        
        return app;
    };
}(window));