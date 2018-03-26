(function(window) {
  class StateChangeEvent {
    /**
     * @param {String}: from: The name of the state from which the machine is transitioning.
     * @param {String}: to: The name of the state to which the machine is transitioning.
     * @param {Object}: target: The state machine that is transitioning.
     * @param {Object}: data: Any data to be included.
     */
    constructor(from, to, target, data) {
      this.type = 'stateChange';
      this.from = from;
      this.to = to;
      this.target = target;
      this.data = data;
    }
  }
  window.StateChangeEvent = StateChangeEvent;

  // use the opspark namespace //
  const opspark = window.opspark = window.opspark || {};

  // create the gamey namespace //
  const gamey = opspark.gamey = opspark.gamey || {};

  const createjs = window.createjs;

  gamey.make = function(updateables = []) {
    console.log('gamey.make');
    const
      app = {},
      messenjah = opspark.factory.dispatcher();

    /*
     * Used to hold the wrapper function returned from
     * calling createjs.Ticker.on('tick', app.update);
     */
    let tickerHandler;
    
    /*
     * Holds the current state Object of the 
     * game, which is a state machine.
     */
    let _state;
    
    /**
     * A dummy Function, used to override a state's transition method
     * when one state cannot transition to another.
     */
    function doNothing() { }
    
    /**
     * A factory to create a state. An object oriented approach, each
     * state has the same API, but behaviour is overridden per state.
     */
    function makeState(name) {
      return {
        /*
         * The set of transition methods shared by each state. If one
         * state cannot transition to another, the transition method
         * should be overridden with doNothing, a dummy Function.
         */
        lobby: doNothing,
        init: doNothing,
        play: doNothing,
        pause: doNothing,
        end: doNothing,
        
        /*
         * Called from with setState, onExit is called on the current state.
         */
        exit() { },
        
        /*
         * Called from with setState, onEnter is called on the new 
         * state after it's set as the current state.
         */
        enter() { },
        
        getName() { return name; },
      };
    }
    
    const states = {
      lobby: Object.assign(makeState('lobby'), {
        enter(fromState) {
          console.log('enter lobby...');
          messenjah.dispatch(new StateChangeEvent(fromState.getName(), states.lobby.getName(), app));
        },
        init() {
          console.log('lobby state calling init()...');
          setState(states.initializing);
        },
      }),
      
      initializing: Object.assign(makeState('initializing'), {
        enter(fromState) {
          console.log('enter initializing...');
          // let any interested objects know it's time to initialize //
          messenjah.dispatch(new StateChangeEvent(fromState.getName(), states.initializing.getName(), app));
        },
        play() {
          console.log('initializing state calling play()...');
          setState(states.playing);
        },
      }),
      
      playing: Object.assign(makeState('playing'), {
        enter(fromState) {
          console.log('enter playing...');
          tickerHandler = createjs.Ticker.on('tick', app.update);
          messenjah.dispatch(new StateChangeEvent(fromState.getName(), states.playing.getName(), app));
        },
        pause() {
          console.log('playing state calling pause()...');
          setState(states.paused);
        },
        end() {
          console.log('play state calling end()...');
          setState(states.end);
        },
      }),
      
      paused: Object.assign(makeState('paused'), {
        enter(fromState) {
          console.log('enter paused...');
          createjs.Ticker.off('tick', tickerHandler);
          messenjah.dispatch(new StateChangeEvent(fromState.getName(), 'paused', app));
        },
        play() {
          console.log('paused state calling play()...');
          setState(states.playing);
        },
        end() {
          console.log('paused state calling end()...');
          setState(states.end);
        },
      }),
      
      end: Object.assign(makeState('end'), {
        enter(fromState) {
          console.log('enter end...');
          createjs.Ticker.off('tick', tickerHandler);
          messenjah.dispatch(new StateChangeEvent(fromState.getName(), 'end', app));
        },
        lobby() {
          console.log('end state calling lobby()...');
          setState(states.lobby);
        },
      }),
    };
    
    // set the incept state for the game //
    _state = states.lobby;
    
    function setState(toState) {
      
      /* 
       * Call exit() on the current state, letting
       * it know which state we're going to next.
       */
      _state.exit(toState);
      
      // hold the outgoing state before overwriting it //
      const fromState = _state;
      
      // set the new state //
      _state = toState;
      
      /* 
       * Call enter() on the new state, letting
       * it know which state we came from.
       */
      _state.enter(fromState);
    }
    
    const
      canvas = document.getElementById('canvas'),
      stage = new createjs.Stage(canvas);
    Object.assign(app, {
        canvas: canvas,
        stage: stage,
        view: new createjs.Container(),

        setState: setState,
        getStateName() { console.log(_state.getName()); return _state.getName(); },
        
        lobby() { _state.lobby(); },
        init() { _state.init(); },
        play() { _state.play(); },
        pause() { _state.pause(); },
        end() { _state.end(); },

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

        getNumberUpdateables() {
          return updateables.length;
        },
        
        update: function(event) {
          stage.update();
          for (var i = 0; i < updateables.length; i++) {
            updateables[i].update();
          }
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

    // createjs.Touch.enable(_canvas, true, false);

    return app;
  };
}(window));
