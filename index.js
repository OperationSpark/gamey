(function(window, createjs, _) {
  // use the opspark namespace //
  const opspark = _.set(window, 'opspark', window.opspark || {}).opspark;
  
  // create the gamey namespace //
  _.set(opspark, 'gamey.app', 
  /**
   * Creates and returns the gamey app.
   */ 
  function(map, updateables = [], debug = true) {
    // if set to true, will log state transitions //
    let _debug = debug;
    
    if(_debug) console.log('gamey created');
    
    const app = {};

    /*
     * Used to hold the wrapper Function returned from
     * calling createjs.Ticker.on('tick', app.update);
     * Needed to remove the app.update method from the tick event.
     */
    let tickerHandler;
    
    /*
     * Holds the current state Object of the 
     * game, which is a state machine. Set the
     * initial state to incept, which can only
     * transition to the lobby state.
     */
    let _state = _.assign(makeState('incept', map), {
      lobby(data) {
        if(_debug) console.log('incept state calling lobby()...');
        return setState(states.lobby, data);
      },
      exit() {
        return Promise.resolve(true);
      },
    });
    
    /**
     * A dummy Function, used to override a state's transition method
     * when one state cannot transition to another. Returns a resolved
     * Promise.
     */
    function doNothing() { return Promise.resolve(true); }
    
    /**
     * A factory to create a state. An object oriented approach, each
     * state has the same API, but behaviour is overridden per state.
     */
    function makeState(name, map) {
      return {
        _name: name,
        map,
        
        /*
         * The set of transition methods shared by each state. If one
         * state cannot transition to another, the transition method
         * should be overridden with doNothing, a dummy Function.
         */
        lobby: doNothing,
        play: doNothing,
        pause: doNothing,
        end: doNothing,
        
        /*
         * Called from with setState, onExit is called on the current state.
         * Here we provide an implementation that most states will share. This
         * means that most states might implement a factory for a manager that
         * exposes the exit() and destroy() API.
         */
        exit(toState) {
          const
            managers = this.map.managers,
            manager = managers[this.getName()];
          return manager.exit().then(() => {
            manager.destroy(); 
            delete managers[this.getName()];
            return true;
          });
        },
        
        /*
         * Called from within the state machine's setState(), 
         * enter() is called on the new state after it is set 
         * as the current state.
         */
        enter(data) { },
        
        getName() { return name; },
      };
    }
    
    // NOTE: all enter() and exit() methods MUST return a Promise.
    const states = {
      lobby: _.assign(makeState('lobby', map), {
        enter(fromState, data) {
          if(_debug) console.log(`enter lobby from ${fromState.getName()}`);
          
          /*
           * Setup the Ticker to call app.update(), but make sure
           * we don't re-add the app.update handler. CreateJS returns
           * the app.update() method in a wrapped Function. It's this
           * wrapped Function we need to remove each time.
           */
          if(tickerHandler) createjs.Ticker.off('tick', tickerHandler);
          tickerHandler = createjs.Ticker.on('tick', app.update);
          if(_debug) console.log(`lobby safely setup app.update to handle tick`);
          
          return createAndRunEnterForManager(app, this.map, 'lobby', data);
        },
        play(data) {
          /*
           * Transition first to the initializing state, 
           * the initializing state will transition to playing.
           */
          if(_debug) console.log('lobby state calling play()...');
          return setState(states.initializing, data);
        },
      }),
      
      initializing: _.assign(makeState('initializing', map), {
        enter(fromState, data) {
          if(_debug) console.log(`enter initializing from ${fromState.getName()}`);
          
          /*
           * Let the initializing state call its play() method to
           * automatically transition to the playing state once
           * the initManager is done with its enter sequence.
           */
          return createAndRunEnterForManager(app, this.map, 'initializing', data)
            .then(() => this.play(data));
        },
        play(data) {
          if(_debug) console.log('initializing state calling play()...');
          
          // make sure we don't re-add the app.update handler //
          if(tickerHandler) createjs.Ticker.off('tick', tickerHandler);
          
          // but make sure the app.update handler is handling tick //
          tickerHandler = createjs.Ticker.on('tick', app.update);
          
          /*
           * Setup the game playing view here in the initializing state's
           * play() transition method, so that entering to the playing 
           * from the paused state doesn't recreate the game playing view.
           */
          return createAndRunEnterForManager(app, this.map, 'playing', data)
            .then(() => setState(states.playing, data));
        },
      }),
      
      playing: _.assign(makeState('playing', map), {
        enter(fromState, data) {
          if(_debug) console.log(`enter playing from ${fromState.getName()}`);
          
          return Promise.resolve(true);
        },
        exit(toState) {
          /*
           * Don't destroy the game view when exiting the playing state, we'll
           * just shut it down. Both pause and end states will place views on 
           * top of the playing view. The transition to the end state will call
           * destroy on the playing view.
           */
          return Promise.resolve(true);
        },
        pause(data) {
          if(_debug) console.log('playing state calling pause()...');
          
          return setState(states.paused, data);
        },
        end(data) {
          if(_debug) console.log('playing state calling end()...');
          return createAndRunEnterForManager(app, this.map, 'end', data)
            .then(() => setState(states.end, data));
        },
      }),
      
      paused: _.assign(makeState('paused', map), {
        enter(fromState, data) {
          if(_debug) console.log(`enter paused from ${fromState.getName()}`);
          
          return createAndRunEnterForManager(app, this.map, 'paused', data);
        },
        play(data) {
          if(_debug) console.log('paused state calling play()...');
          return setState(states.playing, data);
        },
        end(data) {
          if(_debug) console.log('paused state calling end()...');
          return createAndRunEnterForManager(app, this.map, 'end', data)
            .then(() => setState(states.end, data));
        },
      }),
      
      end: _.assign(makeState('end', map), {
        enter(fromState, data) {
          if(_debug) console.log(`enter end from ${fromState.getName()}`);
          
          // pause playing assets, show stats or game over //
          
          /* 
           * Let the playing or paused states' end() transition
           * method create the end manager and view.
           */
        },
        lobby(data) {
          if(_debug) console.log('end state calling lobby()...');
          return destroyPlayingFeatureAndGoToState(this.map, states.lobby, data); 
        },
        play(data) {
          /*
           * Transition first to the initializing state, 
           * the initializing state will transition to playing.
           */
          if(_debug) console.log('lobby state calling play()...');
          return destroyPlayingFeatureAndGoToState(this.map, states.initializing, data);
        },
      }),
    };
    
    function destroyPlayingFeatureAndGoToState(map, toState, data) {
      const
        name = states.playing.getName(),
        playingManager = map.managers[name];
      return playingManager.exit()
        .then(() => {
          playingManager.destroy(); 
          delete map.managers[name];
          return setState(toState, data);
        });
    }
    
    function createAndRunEnterForManager(app, map, feature, data) {
      const
        factories = map.factories,
        managers = map.managers,
        /*
         * Data is passed to the constructor of the manager: can be used 
         * to make views/features more dynamic as they're constructed.
         */
        manager = factories[feature].manager(factories[feature].view(app), app, data);
      
      managers[feature] = manager;
      return manager.enter();
    }
    
    function setState(toState, data) {
      // used to hold the outgoing state before overwriting it // 
      let fromState;
      
      /* 
       * Call exit() on the current state, letting
       * it know which state we're going to next.
       */
      return _state.exit(toState)
        .then(() => fromState = _state)
        
        /* 
         * Set the new state
         */
        .then(() => _state = toState)
        
        /* 
         * Call enter() on the new state, letting
         * it know which state we came from.
         */
        .then(() => _state.enter(fromState, data));
    }
    
    const
      canvas = document.getElementById('canvas'),
      stage = new createjs.Stage(canvas);
    _.assign(app, {
        canvas: canvas,
        stage: stage,
        
        // the parent Container for all feature views //
        view: new createjs.Container(),
        
        // positioned above the view by one z-level to hold controls //
        hud: new createjs.Container(),

        setState: setState,
        getStateName() { return _state.getName(); },
        
        /*
         * NOTE: There's no transition method to the initializing
         * state, initializing is reached by calling play() in either
         * the lobby or end states.
         */
        lobby(data) { return _state.lobby(data); },
        play(data) { return _state.play(data); },
        pause(data) { return _state.pause(data); },
        end(data) { return _state.end(data); },

        addUpdateable: function(updateable) {
          updateables.push(updateable);
          return app;
        },

        removeUpdateable: function(updateable) {
          const index = updateables.indexOf(updateable);
          if (index > -1) {
            updateables.splice(index, 1);
          }
          return app;
        },

        getNumberUpdateables() {
          return updateables.length;
        },
        
        update: function(event) {
          stage.update();
          for (var i = 0; i < updateables.length; i++) {
            updateables[i].update();
          }
        },
        
        /**
         * @param: {Boolean} value: If true, the app will log state transitions.
         */
        setDebug(value) {
          _debug = value;
          return app;
        },
        
        /**
         * @return {Boolean}: Returns true if the game is set to debug mode.
         */
        getDebug() {
          return _debug;
        },
      });

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
    app.stage.addChild(app.hud);
    createjs.Ticker.framerate = 60;

    // createjs.Touch.enable(_canvas, true, false);

    return app;
  });
}(window, window.createjs, window._));
