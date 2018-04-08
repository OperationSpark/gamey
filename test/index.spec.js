/*
 * NOTE: these tests are stateful: can't get beforeEach / afterEach to work!
 */

const
  expect = window.chai.expect,
  createjs = window.createjs,
  opspark = window.opspark,
  draw = opspark.draw,
  gamey = opspark.gamey;

/*
 * gamey() must take a map of factories containing a factory 
 * Function for a view and mediator per main app feature.
 */
const app = gamey.app({
      // used to hold view factories for the concrete game //
      factories: {
        lobby: {
          mediator: opspark.gamey.mediator,
          view: opspark.gamey.view,
        },
        initializing: {
          mediator: opspark.gamey.mediator,
          view: opspark.gamey.view,
        },
        // NOTE: concrete view/mediator for playing feature in tests //
        playing: {
          mediator: opspark.gamey.playingMediator,
          view: opspark.gamey.playing,
        },
        paused: {
          mediator: opspark.gamey.mediator,
          view: opspark.gamey.view,
        },
        end: {
          mediator: opspark.gamey.mediator,
          view: opspark.gamey.view,
        }
      },
      // used by gamey to hold references to instances of mediators //
      mediators: {
      },
    });

describe('gamey', function () {
  
  describe('gamey', function () {
    it('should return an Object', function () {
      expect(app).to.be.an('object');
    });
    it('should have correct API', function () {
      expect(app).to.have.keys(
        'canvas',
        'stage',
        
        'view',
        'hud',
        
        'setState',
        'getStateName',
        
        'lobby',
        'play',
        'pause',
        'end',
        
        'addUpdateable',
        'removeUpdateable',
        'getNumberUpdateables',
        'update',
        
        'setDebug',
        'getDebug');
    });
  });
  
  // describe('addUpdateable', function () {
  //   it('should add an object with an update function to the app', function () {
  //     const asset = draw.circle(10, "#CCC");
  //     asset.y = asset.radius;
  //     const
  //       updateable = {
  //         asset: asset,
  //         update() {
  //           ++asset.x;
  //           if(asset.x - asset.radius > app.canvas.width) asset.x = -asset.radius;
  //         }
  //       };
  //     app.view.addChild(updateable.asset);
  //     app.addUpdateable(updateable);
      
  //     expect(app.getNumberUpdateables()).to.equal(1);
  //   });
  // });
  
  // leaves app in lobby state //
  describe('incept -> lobby', function () {
    it('should transition from incept to lobby state', function (done) {
      expect(app.getStateName()).to.equal('incept');
      
      /*
       * Each transition method can take a data object, which will be passed
       * to the mediator's factory method on its creation. This allows for 
       * flexible views, etc. In this case, we pass {name: 'lobby'}, which 
       * allows a general mediator to set this text on a general view.
       */
      app.lobby({name: 'lobby'})
        .then(() => {
          expect(app.getStateName()).to.equal('lobby');
          done();
        });
    });
  });
  
  // leaves app in playing state //
  describe('lobby -> initializing -> playing', function () {
    it('should transition from lobby to initializing state then playing state', function (done) {
      expect(app.getStateName()).to.equal('lobby');
      // will transition first to the initializing state //
      app.play({name: 'initializing'}) 
        .then(() => {
          expect(app.getStateName()).to.equal('playing');
          done();
        });
    });
  });
  
  // toggles app between playing and paused states, leaves app in playing state //
  describe('play -> pause -> play', function () {
    it('should transition from playing state to paused state', function (done) {
      expect(app.getStateName()).to.equal('playing');
      
      setTimeout(() => {
        app.pause({name: 'paused'})
        .then(() => {
          expect(app.getStateName()).to.equal('paused');
        });
      }, 200);
      setTimeout(() => {
        /*
         * NOTE: we're not passing data to the play() transition method.
         * In these tests, there's a concrete playing view and mediator.
         */
        app.play()
        .then(() => {
          expect(app.getStateName()).to.equal('playing');
        });
      }, 1300);
      setTimeout(() => { 
        app.pause({name: 'paused'})
        .then(() => {
          expect(app.getStateName()).to.equal('paused');
        });
      }, 1500);
      setTimeout(() => { 
        app.play()
        .then(() => {
          expect(app.getStateName()).to.equal('playing');
          done();
        });
      }, 1900);
    });
  });
  
  // leaves app in end state //
  describe('pause -> end', function () {
    it('should transition from paused state to end state', function (done) {
      expect(app.getStateName()).to.equal('playing');
      app.pause({name: 'paused'})
        .then(() => expect(app.getStateName()).to.equal('paused'))
        .then(() => app.end({name: 'end'}))
        .then(() => expect(app.getStateName()).to.equal('end'))
        .then(() => done());
    });
  });
  
  // // leaves app in lobby state //
  describe('end -> lobby', function () {
    it('should transition from end state to lobby state', function (done) {
      expect(app.getStateName()).to.equal('end');
      app.lobby({name: 'lobby'})
        .then(() => {
          expect(app.getStateName()).to.equal('lobby');
          done();
        });
    });
  });
  
  // leaves app in end state //
  describe('playing -> end -> initializing -> playing -> end', function () {
    it('should transition from playing to end state, and end through initializing to playing states', function (done) {
      expect(app.getStateName()).to.equal('lobby');
      setTimeout(() => {
        app.play({name: 'initializing'})
        .then(() => {
          expect(app.getStateName()).to.equal('playing');
        });
      }, 500);
      setTimeout(() => {
        app.end({name: 'end'})
          .then(() => expect(app.getStateName()).to.equal('end'));
      }, 1000);
      setTimeout(() => {
        app.play({name: 'initializing'})
        .then(() => {
          expect(app.getStateName()).to.equal('playing');
        });
      }, 1500);
      setTimeout(() => {
        app.end({name: 'end'})
          .then(() => expect(app.getStateName()).to.equal('end'))
          .then(() => done());
      }, 1900);
    });
  });
  
  
  
  // leaves app in lobby state //
  describe('lobby do nothings', function () {
    it('should not transition to play, pause or end states', function (done) {
      expect(app.getStateName()).to.equal('end');
      setTimeout(() => {
        app.lobby({name: 'lobby'})
          .then(() => expect(app.getStateName()).to.equal('lobby'))
          .then(() => app.pause())
          .then(() => app.end())
          .then(() => expect(app.getStateName()).to.equal('lobby'))
          .then(() => done());
      }, 500);
    });
  });
  
  // TODO: we can only run this test of init takes a degree of async time //
  // // leaves app in initializing state //
  // describe('initializing do nothings', function () {
  //   it('should not transition to lobby, pause or end states', function (done) {
  //     expect(app.getStateName()).to.equal('lobby');
  //     setTimeout(() => {
  //       app.init();
  //       updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
  //       app.lobby();
  //       app.pause();
  //       app.end();
        
  //       expect(app.getStateName()).to.equal('initializing');
  //       done();
  //     }, 500);
  //   });
  // });
  
  // leaves app in playing state //
  describe('playing do nothings', function () {
    it('should not transition to lobby, playing, or initializing states', function (done) {
      expect(app.getStateName()).to.equal('lobby');
      setTimeout(() => {
        app.play()
          .then(() => expect(app.getStateName()).to.equal('playing'))
          .then(() => app.lobby())
          .then(() => app.play())
          .then(() => expect(app.getStateName()).to.equal('playing'))
          .then(() => done());
      }, 500);
    });
  });
  
  // leaves app in paused state //
  describe('paused do nothings', function () {
    it('should not transition to lobby or initializing states', function (done) {
      expect(app.getStateName()).to.equal('playing');
      setTimeout(() => {
        app.pause({name: 'paused'})
          .then(() => expect(app.getStateName()).to.equal('paused'))
          .then(() => app.lobby())
          .then(() => expect(app.getStateName()).to.equal('paused'))
          .then(() => done());
      }, 500);
    });
  });
  
  // leaves app in end state //
  describe('end do nothings', function () {
    it('should not transition to paused state', function (done) {
      expect(app.getStateName()).to.equal('paused');
      setTimeout(() => {
        app.end({name: 'end'})
          .then(() => expect(app.getStateName()).to.equal('end'))
          .then(() => app.pause())
          .then(() => expect(app.getStateName()).to.equal('end'))
          .then(() => done());
      }, 500);
    });
  });
  
  // leaves app in play state //
  describe('ALL DONE', function () {
    it('should be fun', function (done) {
      expect(app.getStateName()).to.equal('end');
      setTimeout(() => {
        app.lobby({name: 'lobby'})
          .then(() => app.play({name: 'initializing'}))
          .then(() => expect(app.getStateName()).to.equal('playing'))
          .then(() => console.log(app.getNumberUpdateables()))
          /*
           * NOTE: this assertion is stateful, for these tests, 
           * the playing view should add only one updateable.
           */
          .then(() => expect(app.getNumberUpdateables()).to.equal(1))
          .then(() => done());
      }, 500);
    });
  });
  
});