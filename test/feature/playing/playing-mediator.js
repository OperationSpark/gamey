(function(opspark, _) {
  // create a namespace for the playingMediator //
  _.set(opspark, 'gamey.playingMediator',
    /**
     * Creates and returns the playing mediator.
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
       * Return the mediator API: Each mediator must expose its view,
       * a liquify() method used for repositioning components on screen 
       * resize, a destroy() method used to clean up any references, and 
       * methods enter(), exit(), which must return a Promise that 
       * resolves when the enter or exit sequence is complete.
       */
      return {
        view,
        liquify() {
          // delegate liquify to the view, or implement your own //
          return view.liquify();
        },
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
            
            // remove the updateable object from the game //
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
