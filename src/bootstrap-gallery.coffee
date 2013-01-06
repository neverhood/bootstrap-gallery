# Quick gallery implementation using bootstrap's modal windows
#

((($) ->

    defaultOptions =
        processMeta: false,
        navigation: 'image' # must be "container" or "image"
        amountOfImagesToPreload: 2,
        selector: 'a.gallery-item' # don't set this to plain 'a', give your gallery item a class
        modal:
            selector: 'div#gallery-modal',
            imageContainer: 'div#gallery-modal-image-container'

    settings = {
        elems: [],
        links: [],
        index: 0
    }

    methods = {
        init: (options) ->
            options = if options? then $.extend(defaultOptions, options) else defaultOptions

            # Check if meta processing is required
            if options.containerSelector? or options.metaSelector? or options.modal.metaSelector?
                if not options.containerSelector? or not options.metaSelector? or not options.modal.metaSelector?
                    # One of required selectors is missing
                    $.error "bootstrapGallery: one or more of the following options were specified: 'containerSelector', 'metaSelector', 'modal.metaSelector'. " +
                        "However, it is required to specify all of the these in order to enable meta processing"
                else # Both meta selectors provided
                    options.processMeta = true

            # Validate navigation
            if not options.navigation? or not ( options.navigation == 'image' or options.navigation == 'container' )
                $.error "bootstrapGallery: options.navigation must be set to either 'image' or 'container'"

            # maintain chainability
            this.each ->
                $this  = $(this)
                $modal = $( options.modal.selector )

                # Verify if modal is present
                $.error "bootstrapGallery: unable to find a modal with selector: #{ options.modal.selector }" unless $modal.length

                $this.data('bootstrap-gallery', true) unless $this.data('bootstrap-gallery')?

                ## BINDINGS ##
                # When one of the gallery images is clicked, bring up the modal
                $this.on 'click.bootstrap-gallery', options.selector, methods.show

                # React to clicks within modal window ( switching images )
                if options.navigation == 'container'
                    $modal.on 'click.bootstrap-gallery', options.modal.imageContainer, methods.update
                    $modal.on 'hover.bootstrap-gallery', options.modal.imageContainer, methods.toggleNavigation
                else
                    selector = options.modal.imageContainer + ' img'

                    $modal.on 'click.bootstrap-gallery', selector, methods.update
                    $modal.on 'hover.bootstrap-gallery', selector, methods.toggleNavigation


                $(window).bind 'resize.bootstrap-gallery', methods.reposition
                $(document).bind('keydown.bootstrap-gallery', methods.handleKeydown).
                    # show some respect to turbolinks
                    bind('page:change', methods.destroy)

                settings.galleryContainer = $this
                settings = $.extend(settings, options)

        destroy: ->
            modal = $(settings.modal.selector)

            settings.galleryContainer.removeData('bootstrap-gallery').off '.bootstrap-gallery'
            modal.off       '.bootstrap-gallery'
            $(window).off   '.bootstrap-gallery'
            $(document).off '.bootstrap-gallery'

            settings.galleryContainer

        next: ->
            settings.index += 1
            settings.index = 0 if settings.index > settings.links.length - 1

            methods.preloadImages()
            methods.append()

        prev: ->
            settings.index -= 1
            settings.index = settings.links.length - 1 if settings.index < 0

            methods.preloadImages()
            methods.append()

        handleKeydown: (event) ->
            methods.prev() if event.which == 37
            methods.next() if event.which == 39

            event.preventDefault() if event.which == 37 or event.which == 39

        reposition: ->
            modal = $(settings.modal.selector)
            modal.css marginLeft: - (modal.width() / 2)

        append: ->
            $modal = $( settings.modal.selector )
            $modal.find( settings.modal.imageContainer ).html( "<img src='#{ settings.links[settings.index] }' />" )

            if settings.processMeta
                meta = $( settings.elems[ settings.index ] ).parents(settings.containerSelector).find(settings.metaSelector)
                $modal.find( settings.modal.metaSelector ).html meta.html()

            $modal.modal('show') unless $modal.is(':visible')

        preloadImages: ->
            # TODO: improve this one, maybe also preload backwards?
            $.each settings.links.slice(settings.index + 1, settings.index + settings.amountOfImagesToPreload + 1), (index, link) ->
                img = new Image
                img.src = link

        # Evented
        show: (event) ->
            event.preventDefault()

            settings.elems = settings.galleryContainer.find( settings.selector )
            settings.links = $.map(settings.elems, (elem) -> elem.href)
            settings.index = settings.elems.index(this)

            methods.reposition()
            methods.preloadImages()

            methods.append()

        update: (event) ->
            event.preventDefault()
            $this = $(this)

            if ( (event.pageX - $this.offset().left) / $this.width() ) < 0.5
                methods.prev()
            else
                methods.next()

        toggleNavigation: (event) ->
            event.preventDefault()

    }

    $.fn.bootstrapGallery = (method) ->
        if method.constructor is Object or not method? # options or null passed, pass to init
            methods.init.apply this, arguments
        else if methods[method]? # existing method called
            methods[method].apply this, Array.prototype.slice.call(arguments, 1)
        else
            $.errors "bootstrapGallery does not have a method #{ method }"

))(jQuery)
