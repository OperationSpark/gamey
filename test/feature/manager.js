(function(opspark, _) {
  // create a namespace for a manager //
  _.set(opspark, 'gamey.manager',
    /**
     * Creates and returns a general manager.
     */
    function(view, game, data) {
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
