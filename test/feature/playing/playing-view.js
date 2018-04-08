(function(opspark, createjs, draw, _) {

  // create a namespace for the playing view //
  _.set(opspark, 'gamey.playing',
    /**
     * Creates and returns the playing view.
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
      const
        textfield = draw.textfield('INCEPT', 'bold 60px Arial', '#CCC', ),
        circle = draw.circle(10, "#CCC");
        
      // add all view components to the view container //
      asset.addChild(textfield, circle);
      
      
      /**
       * Called when the asset is added to the stage.
       * Use render() to build and position components.
       */
      function render() {
        textfield.x = canvas.width / 2;
        textfield.y = 60;
        
        circle.y = textfield.y + textfield.getBounds().height + circle.radius + 10;
      }
      
      // called on screen resize //
      function liquify() {
        // If necessary, tween components into position relative to canvas here //
      }

      // setup a one-time added-to-parent listener //
      asset.on('added', onAdded);

      function onAdded(event) {
        if (game.getDebug()) console.log('playing view added to stage');
        asset.off('added', onAdded);
        render();
      }

      function setText(text) {
        textfield.text = text;
      }

      /*
       * Return the view API: It MUST expose the asset, the render method, and 
       * the liquify method. However, any other child components or API needed 
       * to control this view can be exposed.
       */
      return {
        asset,
        render,
        liquify,
        circle,
        setText,
        startTextTween() {
          return createjs.Tween.get(textfield, { loop: true })
            .to({ alpha: 0 }, 1000, createjs.Ease.getPowInOut(4))
        },
        stopTextTween() {
          return createjs.Tween.removeTweens(textfield);
        },
      };
    });
}(window.opspark, window.createjs, window.opspark.draw, window._));
