define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var Graphic = ComponentView.extend({
        
        events: {
            "click .graphiclink-widget": "onClick" 
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:changed', this.resizeImage);

            // Checks to see if the graphic should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.resizeImage(Adapt.device.screenSize, true);
        },

        // Used to check if the graphic should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-widget').off('inview');
                    this.setCompletionStatus();
                }

            }
        },

        onClick: function() {
            var url = this.model.get("_url");
            var target = this.model.get("_target") || "_blank";
            switch (target) {
                case "_self":
                    if (url.substr(0,1) === "#") {
                        Backbone.history.navigate(url, { trigger: true });
                    } else {
                        window.location.href = url;
                    }
                    break;
                default:
                    window.open(url, target);
            }
            if (this.completionEvent !== "click") return;
            this.setCompletionStatus();
        },

        remove: function() {
          // Remove any 'inview' listener attached.
          this.$('.component-widget').off('inview');

          ComponentView.prototype.remove.apply(this, arguments);
        },

        resizeImage: function(width, setupInView) {
            var imageWidth = width === 'medium' ? 'small' : width;
            var imageSrc = (this.model.get('_graphic')) ? this.model.get('_graphic')[imageWidth] : '';
            this.$('.graphiclink-widget img').attr('src', imageSrc);

            this.$('.graphiclink-widget').imageready(_.bind(function() {
                this.setReadyStatus();

                if (setupInView) {
                    // Bind 'inview' once the image is ready.
                    this.completionEvent = (!this.model.get('_setCompletionOn')) ? 'click' : this.model.get('_setCompletionOn');
                    if (this.completionEvent != "click") {
                        this.$('.component-widget').on('inview', _.bind(this.inview, this));
                    }
                }
            }, this));
        }

    });

    Adapt.register('graphiclink', Graphic);

    return Graphic;

});
