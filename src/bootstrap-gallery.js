(function() {

  (function($) {
    var defaultOptions, methods, settings;
    defaultOptions = {
      processMeta: false,
      navigation: 'image',
      amountOfImagesToPreload: 2,
      selector: 'a.gallery-item',
      modal: {
        selector: 'div#gallery-modal',
        imageContainer: 'div#gallery-modal-image-container'
      }
    };
    settings = {
      elems: [],
      links: [],
      index: 0
    };
    methods = {
      init: function(options) {
        options = options != null ? $.extend(defaultOptions, options) : defaultOptions;
        if ((options.containerSelector != null) || (options.metaSelector != null) || (options.modal.metaSelector != null)) {
          if (!(options.containerSelector != null) || !(options.metaSelector != null) || !(options.modal.metaSelector != null)) {
            $.error("bootstrapGallery: one or more of the following options were specified: 'containerSelector', 'metaSelector', 'modal.metaSelector'. " + "However, it is required to specify all of the these in order to enable meta processing");
          } else {
            options.processMeta = true;
          }
        }
        if (!(options.navigation != null) || !(options.navigation === 'image' || options.navigation === 'container')) {
          $.error("bootstrapGallery: options.navigation must be set to either 'image' or 'container'");
        }
        return this.each(function() {
          var $modal, $this, selector;
          $this = $(this);
          $modal = $(options.modal.selector);
          if (!$modal.length) {
            $.error("bootstrapGallery: unable to find a modal with selector: " + options.modal.selector);
          }
          if ($this.data('bootstrap-gallery') == null) {
            $this.data('bootstrap-gallery', true);
          }
          $this.on('click.bootstrap-gallery', options.selector, methods.show);
          if (options.navigation === 'container') {
            $modal.on('click.bootstrap-gallery', options.modal.imageContainer, methods.update);
            $modal.on('hover.bootstrap-gallery', options.modal.imageContainer, methods.toggleNavigation);
          } else {
            selector = options.modal.imageContainer + ' img';
            $modal.on('click.bootstrap-gallery', selector, methods.update);
            $modal.on('hover.bootstrap-gallery', selector, methods.toggleNavigation);
          }
          $(window).bind('resize.bootstrap-gallery', methods.reposition);
          $(document).bind('keydown.bootstrap-gallery', methods.handleKeydown).bind('page:change', methods.destroy);
          settings.galleryContainer = $this;
          return settings = $.extend(settings, options);
        });
      },
      destroy: function() {
        var modal;
        modal = $(settings.modal.selector);
        settings.galleryContainer.removeData('bootstrap-gallery').off('.bootstrap-gallery');
        modal.off('.bootstrap-gallery');
        $(window).off('.bootstrap-gallery');
        $(document).off('.bootstrap-gallery');
        return settings.galleryContainer;
      },
      next: function() {
        settings.index += 1;
        if (settings.index > settings.links.length - 1) {
          settings.index = 0;
        }
        methods.preloadImages();
        return methods.append();
      },
      prev: function() {
        settings.index -= 1;
        if (settings.index < 0) {
          settings.index = settings.links.length - 1;
        }
        methods.preloadImages();
        return methods.append();
      },
      handleKeydown: function(event) {
        if (event.which === 37) {
          methods.prev();
        }
        if (event.which === 39) {
          methods.next();
        }
        if (event.which === 37 || event.which === 39) {
          return event.preventDefault();
        }
      },
      reposition: function() {
        var modal;
        modal = $(settings.modal.selector);
        return modal.css({
          marginLeft: -(modal.width() / 2)
        });
      },
      append: function() {
        var $modal, meta;
        $modal = $(settings.modal.selector);
        $modal.find(settings.modal.imageContainer).html("<img src='" + settings.links[settings.index] + "' />");
        if (settings.processMeta) {
          meta = $(settings.elems[settings.index]).parents(settings.containerSelector).find(settings.metaSelector);
          $modal.find(settings.modal.metaSelector).html(meta.html());
        }
        if (!$modal.is(':visible')) {
          return $modal.modal('show');
        }
      },
      preloadImages: function() {
        return $.each(settings.links.slice(settings.index + 1, settings.index + settings.amountOfImagesToPreload + 1), function(index, link) {
          var img;
          img = new Image;
          return img.src = link;
        });
      },
      show: function(event) {
        event.preventDefault();
        settings.elems = settings.galleryContainer.find(settings.selector);
        settings.links = $.map(settings.elems, function(elem) {
          return elem.href;
        });
        settings.index = settings.elems.index(this);
        methods.reposition();
        methods.preloadImages();
        return methods.append();
      },
      update: function(event) {
        var $this;
        event.preventDefault();
        $this = $(this);
        if (((event.pageX - $this.offset().left) / $this.width()) < 0.5) {
          return methods.prev();
        } else {
          return methods.next();
        }
      },
      toggleNavigation: function(event) {
        return event.preventDefault();
      }
    };
    return $.fn.bootstrapGallery = function(method) {
      if (method.constructor === Object || !(method != null)) {
        return methods.init.apply(this, arguments);
      } else if (methods[method] != null) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else {
        return $.errors("bootstrapGallery does not have a method " + method);
      }
    };
  })(jQuery);

}).call(this);
