(function(opspark, createjs, draw, _) {
    
  // create a namespace for a view //
  _.set(opspark, 'gamey.view', 
  /**
   * Creates and returns a general view.
   */
  function(game) {
    const
      canvas = game.canvas,
      
      /*
       * asset is the parent Container for this view. Use
       * asset.addChild() to add child components to the view.
       */
      asset = new createjs.Container();
      
    // create view components here //
    const textfield = draw.textfield('INCEPT', 'bold 60px Arial', '#CCC', );
    
    /**
     * Called when the asset is added to the stage.
     * Use render() to build and position components.
     */
    function render() {
      textfield.x = canvas.width / 2;
      textfield.y = 10;
      asset.addChild(textfield);
    }
    
    // setup a one-time added-to-parent listener //
    asset.on('added', onAdded);
    function onAdded(event) {
      if(game.getDebug()) console.log(`${textfield.text} view added to stage`);
      asset.off('added', onAdded);
      render();
    }
    
    function setText(text) {
      textfield.text = text;
    }

    /*
     * Return the view API: It must expose asset
     * property, but you can expose any other child
     * componets or API needed to control this view.
     */
    return {
      asset,
      setText,
    };
  });
}(window.opspark, window.createjs, window.opspark.draw, window._));
