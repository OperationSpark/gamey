(function(opspark, _) {
  // create a namespace for the playingManager //
  _.set(opspark, 'gamey.playingManager',
    /**
     * Creates and returns the playing manager.
     */
    function(view, game, data) {
      const
        canvas = game.canvas,
        circle = view.circle,
        updateable = {
          asset: circle,
          update() {
            ++circle.x;
            if (circle.x - circle.radius > canvas.width) circle.x = -circle.radius;
          }
        };

      /*
       * Return the manager API: Each manager must expose its view,
       * a destroy() method used to clean up any references, and 
       * methods enter(), exit(), which must return a Promise that 
       * resolves when the enter or exit sequence is complete.
       */
      return {
        view,
        enter() {
          return new Promise(function(resolve, reject) {
            view.setText('playing');
            view.startTextTween();
            
            // add an updateable object to the game //
            game.addUpdateable(updateable);
            
            game.view.addChild(view.asset);
            resolve();
          });
        },
        exit() {
          return new Promise(function(resolve, reject) {
            view.stopTextTween();
            
            // add an updateable object to the game //
            game.removeUpdateable(updateable);
            
            resolve();
          });
        },
        destroy() {
          game.view.removeChild(view.asset);
        }
      };

    });
}(window.opspark, window._));
