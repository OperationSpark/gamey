/*
 * NOTE: these tests are stateful: can't get beforeEach / afterEach to work!
 * If needed, to reset state at the end of each test, call:
 *    clearHandlers();
 *    app.end();
 */

const
  expect = window.chai.expect,
  createjs = window.createjs,
  opspark = window.opspark,
  draw = opspark.draw,
  gamey = opspark.gamey;

const app = gamey.make();

// textfield(text, sizeAndFont, color, align, baseline, x, y)
const textfield = draw.textfield(`STATE: ${app.getStateName().toUpperCase()}`, 'bold 36px Arial', '#CCC', 'left');
textfield.x = 60;
textfield.y = 15;
app.view.addChild(textfield);

function updateTextfield(text) {
    textfield.text = text;
    app.stage.update();
  }

describe('gamey', function () {
  
  describe('make', function () {
    it('should return an Object', function () {
      expect(app).to.be.an('object');
    });
    it('should have correct API', function () {
      expect(app).to.have.keys(
        'canvas',
        'stage',
        'view',
        
        'setState',
        'getStateName',
        
        'lobby',
        'init',
        'play',
        'pause',
        'end',
        
        'addUpdateable',
        'removeUpdateable',
        'getNumberUpdateables',
        'update',
        
        'on',
        'once',
        'off',
        'has',
        'dispatch',
        'clearHandlers');
    });
  });
  
  describe('addUpdateable', function () {
    it('should add an object with an update function to the app', function () {
      const asset = draw.circle(10, "#CCC");
      asset.y = asset.radius;
      const
        updateable = {
          asset: asset,
          update() {
            ++asset.x;
            if(asset.x - asset.radius > app.canvas.width) asset.x = -asset.radius;
          }
        };
      app.view.addChild(updateable.asset);
      app.addUpdateable(updateable);
      
      expect(app.getNumberUpdateables()).to.equal(1);
    });
  });
  
  // leaves app in initializing state //
  describe('lobby -> initializing', function () {
    console.log('describe lobby');
    expect(app.getStateName()).to.equal('lobby');
    it('should transition from lobby to initializing state and dispatch appropriate stateChange event', function () {
      app.once('stateChange', event => {
        expect(event).to.be.an('object');
        expect(event.from).to.equal('lobby');
        expect(event.to).to.equal('initializing');
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      });
      app.init();
      app.clearHandlers();
    });
  });
  
  // leaves app in playing state //
  describe('initializing -> play', function () {
    it('should transition from initializing to playing state and dispatch appropriate stateChange event', function () {
      expect(app.getStateName()).to.equal('initializing');
      app.once('stateChange', event => {
        expect(event).to.be.an('object');
        expect(event.from).to.equal('initializing');
        expect(event.to).to.equal('playing');
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      });
      app.play();
      app.clearHandlers();
    });
  });
  
  // toggles app between playing and paused states, leaves app in playing state //
  describe('play -> pause -> play', function () {
    it('should transition from playing state to paused state and dispatch appropriate stateChange event', function (done) {
      expect(app.getStateName()).to.equal('playing');
      app.once('stateChange', event => {
        expect(event.from).to.equal('playing');
        expect(event.to).to.equal('paused');
      });
      setTimeout(() => {
        app.pause(); 
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 500);
      setTimeout(() => { 
        app.play()
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 1000);
      setTimeout(() => { 
        app.pause()
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 1500);
      setTimeout(() => { 
        app.play(); 
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        done();
      }, 1900);
      app.clearHandlers();
    });
  });
  
  // leaves app in end state //
  describe('pause -> end', function () {
    it('should transition from paused state to end state', function () {
      expect(app.getStateName()).to.equal('playing');
      app.pause();
      app.once('stateChange', event => {
        expect(event.from).to.equal('paused');
        expect(event.to).to.equal('end');
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      });
      app.end();
      app.clearHandlers();
    });
  });
  
  // leaves app in lobby state //
  describe('end -> lobby', function () {
    it('should transition from end state to lobby state', function () {
      expect(app.getStateName()).to.equal('end');
      app.pause();
      app.once('stateChange', event => {
        expect(event.from).to.equal('end');
        expect(event.to).to.equal('lobby');
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      });
      app.lobby();
      app.clearHandlers();
    });
  });
  
  // leaves app in end state //
  describe('end -> lobby', function () {
    it('should transition from paused state to end state', function (done) {
      expect(app.getStateName()).to.equal('lobby');
      setTimeout(() => {
        app.init();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 500);
      setTimeout(() => {
        app.play();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 1000);
      setTimeout(() => {
        app.once('stateChange', event => {
          expect(event.from).to.equal('playing');
          expect(event.to).to.equal('end');
          updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        });
        app.end();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        done();
      }, 1500);
    });
  });
  
  // leaves app in lobby state //
  describe('lobby do nothings', function () {
    it('should not transition to play, pause or end states', function (done) {
      expect(app.getStateName()).to.equal('end');
      setTimeout(() => {
        app.lobby();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
        app.play();
        app.pause();
        app.end();
        
        expect(app.getStateName()).to.equal('lobby');
        done();
      }, 500);
    });
  });
  
  // leaves app in initializing state //
  describe('initializing do nothings', function () {
    it('should not transition to lobby, pause or end states', function (done) {
      expect(app.getStateName()).to.equal('lobby');
      setTimeout(() => {
        app.init();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
        app.lobby();
        app.pause();
        app.end();
        
        expect(app.getStateName()).to.equal('initializing');
        done();
      }, 500);
    });
  });
  
  // leaves app in playing state //
  describe('playing do nothings', function () {
    it('should not transition to lobby or initializing states', function (done) {
      expect(app.getStateName()).to.equal('initializing');
      setTimeout(() => {
        app.play();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
        app.lobby();
        app.init();
        
        expect(app.getStateName()).to.equal('playing');
        done();
      }, 500);
    });
  });
  
  // leaves app in paused state //
  describe('paused do nothings', function () {
    it('should not transition to lobby or initializing states', function (done) {
      expect(app.getStateName()).to.equal('playing');
      setTimeout(() => {
        app.pause();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
        app.lobby();
        app.init();
        
        expect(app.getStateName()).to.equal('paused');
        done();
      }, 500);
    });
  });
  
  // leaves app in end state //
  describe('end do nothings', function () {
    it('should not transition to initializing, playing or paused states', function (done) {
      expect(app.getStateName()).to.equal('paused');
      setTimeout(() => {
        app.end();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        
        app.init();
        app.play();
        app.pause();
        
        expect(app.getStateName()).to.equal('end');
        done();
      }, 500);
    });
  });
  
  // leaves app in play state //
  describe('ALL DONE', function () {
    it('should be fun', function (done) {
      expect(app.getStateName()).to.equal('end');
      setTimeout(() => {
        app.lobby();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 500);
      setTimeout(() => {
        app.init();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
      }, 1000);
      setTimeout(() => {
        app.play();
        updateTextfield(`STATE: ${app.getStateName().toUpperCase()}`);
        done();
      }, 1500);
    });
  });
  
  

});