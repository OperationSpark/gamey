const
  expect = window.chai.expect,
  createjs = window.createjs,
  opspark = window.opspark,
  draw = opspark.draw,
  gamey = opspark.gamey;

const app = gamey.make();

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
        'play',
        'pause',
        'quit',
        'unpause',
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
      const asset = draw.circle(10, "#444");
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
  
  describe('play', function () {
    it('should transition from lobby state to playing state', function () {
      app.on('stateChange', event => {
        expect(event).to.be.an('object');
        expect(event.from).to.equal('lobby');
        expect(event.to).to.equal('playing');
      });
      app.play();
      
      app.clearHandlers();
      app.end();
    });
  });
  
  describe('pause', function () {
    it('should transition from playing state to paused state', function () {
      app.play();
      app.on('stateChange', event => {
        expect(event.from).to.equal('playing');
        expect(event.to).to.equal('paused');
      });
      app.pause();
      
      app.clearHandlers();
      app.end();
    });
  });
  
  describe('unpause', function () {
    it('should transition from paused state to playing state', function () {
      app.play();
      app.pause();
      app.on('stateChange', event => {
        expect(event.from).to.equal('paused');
        expect(event.to).to.equal('playing');
      });
      app.unpause();
      
      app.clearHandlers();
      app.end();
    });
  });
  
  describe('quit', function () {
    it('should transition from paused state to playing state', function () {
      app.play();
      app.pause();
      app.on('stateChange', event => {
        expect(event.from).to.equal('paused');
        expect(event.to).to.equal('lobby');
      });
      app.quit();
      
      app.clearHandlers();
    });
  });
  
  describe('end', function () {
    it('should transition from paused state to playing state', function () {
      app.play();
      app.on('stateChange', event => {
        expect(event.from).to.equal('playing');
        expect(event.to).to.equal('lobby');
      });
      app.end();
      
      app.clearHandlers();
    });
  });
  
  
  
  describe('pause with updateables', function () {
    it('should shut down updateables on pause', function (done) {
      const asset = draw.circle(20, "#CCC");
      asset.y = 60;
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
      app.play();
      
      setTimeout(function() { 
        app.pause();
        
        app.clearHandlers();
        app.end();
        
        done();
      }, 1900)
    });
  });
});