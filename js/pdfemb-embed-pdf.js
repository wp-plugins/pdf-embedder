
// JQuery Plugin
jQuery(document).ready(function ($) {
	
    $.fn.pdfEmbedder = function() {
    	
    	this.each(function(index, rawDivContainer) {
    	
    		var divContainer = $(rawDivContainer);
    		
   		    divContainer.append($('<div></div>', {'class': 'pdfemb-loadingmsg'}).append(document.createTextNode('Loading...')));

            var initPdfDoc = function(pdfDoc_, showIsSecure) {
                divContainer.empty().append(
                    $('<div></div>', {'class': 'pdfemb-inner-div'}).append(
                        $('<canvas></canvas>', {'class': 'pdfemb-the-canvas'})
                    )); //style: 'border:1px solid black',

                divContainer.data('pdfDoc', pdfDoc_);

                var toolbar_location = divContainer.data('toolbar');

                if (toolbar_location != 'bottom') {
                    $.fn.pdfEmbedder.addToolbar(divContainer, true, divContainer.data('toolbar-fixed') == 'on', showIsSecure);
                }

                if (toolbar_location != 'top') {
                    $.fn.pdfEmbedder.addToolbar(divContainer, false, divContainer.data('toolbar-fixed') == 'on', showIsSecure);
                }

                // Initial/first page rendering

                divContainer.data('pageCount', pdfDoc_.numPages);

                if (!divContainer.data('pageNum')) {
                    divContainer.data('pageNum', 1);
                }

                divContainer.data('showIsSecure', showIsSecure);
                divContainer.data('pageNumPending', null);
                divContainer.data('zoom', 100);
                $.fn.pdfEmbedder.renderPage(divContainer, divContainer.data('pageNum'));

                divContainer.find('span.pdfemb-page-count').text( pdfDoc_.numPages );

                var grabtopan = new pdfembGrabToPan({
                    element: divContainer.find('div.pdfemb-inner-div')[0]});
                divContainer.data('grabtopan', grabtopan);

                $(window).resize(function() {
					setTimeout(function() {
						$.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));
					}, 100);
                });
            };
	    	
	    	var callback = function(pdf, showIsSecure) {
    			
	  	    	  /**
	  	    	   * Asynchronously downloads PDF.
	  	    	   */
	    		
	  	    	  PDFJS.getDocument(pdf).then(
                      function(pdfDoc_) {
                          initPdfDoc(pdfDoc_, showIsSecure)
                      },
                      function(e) {
                          divContainer.empty().append($('<div></div>', {'class': 'pdfemb-errormsg'}).append(document.createTextNode(e.message)));
                      }
                  );
	  	    	  
	    	};

            if (divContainer.data('pdfDoc')) {
                initPdfDoc(divContainer.data('pdfDoc'), divContainer.data('showIsSecure'));
            }
            else {
                var url = divContainer.attr('data-pdf-url');
                pdfembGetPDF(url, callback);
            }
    	});

    	return this;
 
    };
    
    $.fn.pdfEmbedder.renderPage = function(divContainer, pageNum) {

    	divContainer.data('pageRendering', true);
    	
	    // Using promise to fetch the page
	    var pdfDoc = divContainer.data('pdfDoc');
	    
	    pdfDoc.getPage(pageNum).then(function(page) {
	    	
		    var canvas = $('<canvas></canvas>', {'class': 'pdfemb-the-canvas'}).replaceAll(divContainer.find('.pdfemb-the-canvas'));
		    var scale = 1.0;
		    
		    var vp = page.getViewport(scale);
		    
		    var pageWidth = vp.width;
		    var pageHeight = vp.height;
		    
		    if (pageWidth <= 0 || pageHeight <= 0) {
		    	divContainer.empty().append(document.createTextNode("PDF page width or height are invalid"));
		    	return;
		    }
		    
		    // Max out at parent container width
		    var parentWidth = divContainer.parent().width();
		    
		    var wantWidth = pageWidth;
		    var wantHeight = pageHeight;
		    
		    if (divContainer.data('width') == 'max') {
		    	wantWidth = parentWidth;
		    }
		    else if (divContainer.data('width') == 'auto') {
		    	wantWidth = pageWidth;
		    }
		    else {
		    	wantWidth = parseInt(divContainer.data('width'), 10);
		    	if (isNaN(wantWidth) || wantWidth <= 0) {
		    		wantWidth = parentWidth;
		    	}
		    }
		    
		    if (wantWidth <= 0) {
		    	wantWidth = pageWidth;
		    }
		    
		    // Always max at the parent container width 
		    if (wantWidth > parentWidth && parentWidth > 0) {
		    	wantWidth = parentWidth;
		    }
		    
	    	scale = wantWidth / pageWidth;
	    	wantHeight = pageHeight * scale;

            var fixedToolbars = divContainer.find('div.pdfemb-toolbar-fixed');

			var wantMobile = pdfembWantMobile($, divContainer, wantWidth, userHeight);

			var actualFixedToolbars = wantMobile ? 0 : fixedToolbars.length;

	    	// Height can be overridden by user
	    	var userHeight = parseInt(divContainer.data('height'), 10);
	    	if (isNaN(userHeight) || userHeight <= 0 || userHeight > wantHeight) {
				if (divContainer.data('height') == "auto") { // Mainly for full screen mode
					userHeight = divContainer.parent().height() - actualFixedToolbars * fixedToolbars.height();
				}
				else { // max
					userHeight = wantHeight;
				}
	    	}
	    	
	    	wantWidth = Math.floor(wantWidth);
	    	wantHeight = Math.floor(wantHeight);



		    var zoom = 100;

            var wantCanvasWidth = wantWidth;
            var wantCanvasHeight = wantHeight;

            var canvasHMargin = 0;
            var canvasVMargin = 0;

            if (!wantMobile) {

                zoom = divContainer.data('zoom');

                wantCanvasWidth = wantWidth * zoom / 100;
                wantCanvasHeight = wantHeight * zoom / 100;

                if (wantCanvasWidth < wantWidth) {
                    canvasHMargin = (wantWidth - wantCanvasWidth) / 2;
                }
                if (wantCanvasHeight < userHeight) {
                    canvasVMargin = (userHeight - wantCanvasHeight) / 2;
                }

            }

            var viewport = page.getViewport(scale * zoom / 100);

            // Set values
		      
            if (wantWidth != divContainer.width()) {
                divContainer.width(wantWidth);
            }
			    
            if (divContainer.height() != userHeight) {
                divContainer.height(userHeight + actualFixedToolbars * fixedToolbars.height());
            }

			var innerdiv = divContainer.find('div.pdfemb-inner-div');
			innerdiv.width(wantWidth);
			innerdiv.height(userHeight);

            var fixedTopToolbars = fixedToolbars.filter('.pdfemb-toolbar-top');
            if (actualFixedToolbars > 0) {
                innerdiv.css('top', fixedTopToolbars.height());
            }


            canvas[0].width = wantCanvasWidth;
            canvas[0].height = wantCanvasHeight;
		      
            canvas.css('width', wantCanvasWidth);
            canvas.css('height', wantCanvasHeight);

            canvas.css('left', canvasHMargin).css('top', canvasVMargin);
		      
            // Need to pan?
		      
            if ((wantCanvasWidth > wantWidth || wantCanvasHeight > wantHeight || wantCanvasHeight > userHeight) && !wantMobile) {
                divContainer.data('grabtopan').activate();

                // Adjust panning offset to ensure a recent zoom change centres the doc?

                var fromZoom = divContainer.data('fromZoom');
                var toZoom = divContainer.data('toZoom');

                if (fromZoom > 0 && toZoom > 0) {

                    var oldScrollLeft = innerdiv.scrollLeft();
                    var oldScrollTop = innerdiv.scrollTop();

                    var oldMidX = oldScrollLeft + wantWidth / 2;
                    var oldMidY = oldScrollTop + wantHeight / 2;

                    innerdiv.scrollLeft((oldMidX * toZoom / fromZoom) - wantWidth/2);
                    innerdiv.scrollTop((oldMidY * toZoom / fromZoom) - wantHeight/2);
                }
            }
            else {
              divContainer.data('grabtopan').deactivate();
              divContainer.find('div.pdfemb-inner-div').scrollLeft(0).scrollTop(0); // reset
            }

            divContainer.data('fromZoom',0).data('toZoom', 0);

            pdfembMakeMobile($, wantMobile, divContainer);

            // Render PDF page into canvas context
		      var ctx = canvas[0].getContext('2d');
		      var renderContext = {
		        canvasContext: ctx,
		        viewport: viewport
		      };
		      var renderTask = page.render(renderContext);
	
		      // Wait for rendering to finish
		      renderTask.promise.then(function () {
		    	  divContainer.data('pageNum', pageNum);
		    	  divContainer.data('pageRendering', false);
		    	  
		    	  // Update page counters
		  	      divContainer.find('span.pdfemb-page-num').text( pageNum );
		  	      
		  	      if (pageNum < divContainer.data("pageCount")) {
		  	    	divContainer.find('.pdfemb-next').removeAttr('disabled').removeClass('pdfemb-btndisabled');
		  	      }
		  	      else {
		  	    	divContainer.find('.pdfemb-next').attr('disabled','disabled').addClass('pdfemb-btndisabled');
		  	      }
		  	      
		  	      if (pageNum > 1) {
		  	    	divContainer.find('.pdfemb-prev').removeAttr('disabled').removeClass('pdfemb-btndisabled');
		  	      }
		  	      else {
		  	    	divContainer.find('.pdfemb-prev').attr('disabled','disabled').addClass('pdfemb-btndisabled');
		  	      }
		  	      
			      if (divContainer.data('pageNumPending') !== null) {
			          // New page rendering is pending
			    	  $.fn.pdfEmbedder.renderPage(divContainer, divContainer.data('pageNumPending'));
			    	  divContainer.data('pageNumPending', null);
			      }
		      });
	    });

    };
    
    $.fn.pdfEmbedder.queueRenderPage = function(divContainer, num) {
        if (divContainer.data('pageRendering')) {
        	divContainer.data('pageNumPending', num);
        } else {
        	$.fn.pdfEmbedder.renderPage(divContainer, num);
        }
      };

    $.fn.pdfEmbedder.goFullScreen = function(divContainer) {
        var fsWindow = $('<div class="pdfemb-fs-window"></div>');
        $(document.body).append(fsWindow);
    };
    
    $.fn.pdfEmbedder.addToolbar = function(divContainer, atTop, fixed, showIsSecure){
    	
    	var toolbar = $('<div></div>', {'class': 'pdfemb-toolbar pdfemb-toolbar'+(fixed ? '-fixed' : '-hover')+' '+(atTop ? ' pdfemb-toolbar-top' : 'pdfemb-toolbar-bottom')});
    	var prevbtn = $('<button class="pdfemb-prev">Prev</button>');
    	toolbar.append(prevbtn);
    	var nextbtn = $('<button class="pdfemb-next">Next</button>');
    	toolbar.append(nextbtn);
    	
    	toolbar.append($('<div>Page <span class="pdfemb-page-num">0</span> / <span class="pdfemb-page-count"></span></div>'));

		var zoomoutbtn = $('<button class="pdfemb-zoomout">-</button>');
		toolbar.append(zoomoutbtn);

		var zoominbtn = $('<button class="pdfemb-zoomin">+</button>');
    	toolbar.append(zoominbtn);

    	toolbar.append($('<div>Zoom <span class="pdfemb-zoom">100%</span></div>'));

    	if (showIsSecure) {
	    	toolbar.append($('<div>Secure</div>'));
	    }
    	
    	if (atTop) {
			divContainer.prepend(toolbar);
    	}
    	else {
			divContainer.append(toolbar);
    	}
    	
    	// Add button functions
    	prevbtn.on('click', function (e){
    	    if (divContainer.data('pageNum') <= 1) {
    	        return;
    	      }
    	    divContainer.data('pageNum', divContainer.data('pageNum')-1);
    	    $.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));
    	});

    	nextbtn.on('click', function (e){
    	    if (divContainer.data('pageNum') >= divContainer.data('pdfDoc').numPages) {
    	        return;
    	      }
    	    divContainer.data('pageNum', divContainer.data('pageNum')+1);
    	    $.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));
    	});

        var changeZoom =function(zoomdelta) {
			var oldzoom = divContainer.data('zoom');
			var newzoom = oldzoom + zoomdelta;
			divContainer.data('zoom', newzoom);
			divContainer.find('span.pdfemb-zoom').text( newzoom + '%' );
			$.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));

            divContainer.data('fromZoom', oldzoom).data('toZoom', newzoom);
        };
    	
    	zoominbtn.on('click', function (e){
    	    if (divContainer.data('zoom') >= 500) {
    	        return;
			}
    	    changeZoom(10);
    	});
    	
    	zoomoutbtn.on('click', function (e){
    	    if (divContainer.data('zoom') <= 20) {
    	        return;
			}
			changeZoom(-10);
    	});


        pdfembAddMoreToolbar($, toolbar, divContainer);

		if (!fixed) {
			divContainer.on('mouseenter', function (e) {
					var htoolbar = divContainer.find('div.pdfemb-toolbar-hover');
                    if (htoolbar.data('no-hover') !== true) {
                        htoolbar.show();
                    }
				}
			);
			divContainer.on('mouseleave',
				function (e) {
					var htoolbar = divContainer.find('div.pdfemb-toolbar-hover');
					htoolbar.hide();
				}
			);
		}
    };

    // Apply plugin to relevant divs/};
	
	PDFJS.workerSrc = pdfemb_trans.worker_src;
	PDFJS.cMapUrl = pdfemb_trans.cmap_url;
	PDFJS.cMapPacked = true;
	$('.pdfemb-viewer').pdfEmbedder();
	
});

