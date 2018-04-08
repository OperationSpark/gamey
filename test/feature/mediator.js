(function(opspark, _) {
  // create a namespace for a mediator //
  _.set(opspark, 'gamey.mediator',
    /**
     * Creates and returns a general mediator.
     */
    function(view, game, data) {
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
            view.setText(_.get(data, 'name'));
            game.view.addChild(view.asset);
            resolve();
          });
        },
        exit() {
          return new Promise(function(resolve, reject) {

            resolve();
          });
        },
        destroy() {
          game.view.removeChild(view.asset);
        }
      };

    });
}(window.opspark, window._));
