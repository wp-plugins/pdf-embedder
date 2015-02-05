
// JQuery Plugin
jQuery(document).ready(function ($) {
	
    $.fn.pdfEmbedder = function() {
    	
    	this.each(function(index, rawDivContainer) {
    	
    		var divContainer = $(rawDivContainer);
	    	divContainer.append($('<canvas></canvas>', {'class': 'the-canvas'})); //style: 'border:1px solid black', 
	    	
	    	var url = divContainer.attr('data-pdf-url');
	    	
	    	var callback = function(pdf, showIsSecure) {
    			
	  	    	  /**
	  	    	   * Asynchronously downloads PDF.
	  	    	   */

	  	    	  PDFJS.getDocument(pdf).then(function (pdfDoc_) {
	  	    		divContainer.data('pdfDoc', pdfDoc_);
	  	    	    //document.getElementById('page_count').textContent = this.pdfDoc.numPages;
	  	
	  	    	    $.fn.pdfEmbedder.addToolbar(divContainer, false, showIsSecure);
	  	    	    
	  	    	 // Initial/first page rendering
	  	    	    divContainer.data('pageNum', 1);
	  	    	    divContainer.data('pageNumPending', null);
	  	    	    $.fn.pdfEmbedder.renderPage(divContainer, 1);
	  	    	    
	  	    	    $(window).resize(function() {
	  	    	    	$.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));
	  	    	    });
	  	    	  }, 
	  	    	  function(e) { 
	  	    		  divContainer.empty().append($('<div></div>', {'class': 'pdfemb-errormsg'}).append(document.createTextNode(e.message)));
	  	    	  });
	  	    	  
	    	};
	    	
	    	pdfembGetPDF(url, callback);

    	});

    	return this;
 
    };
    
    $.fn.pdfEmbedder.renderPage = function(divContainer, pageNum) {

    	divContainer.data('pageRendering', true);
    	
	    // Using promise to fetch the page
	    var pdfDoc = divContainer.data('pdfDoc');
	    
	    pdfDoc.getPage(pageNum).then(function(page) {
	    	
		    var canvas = divContainer.find('.the-canvas');
		    var scale = 1.0;
		    
		    var vp = page.getViewport(scale);
		    
		    var pageWidth = vp.width;
		    var pageHeight = vp.height;
		    
		    if (pageWidth <= 0 || pageHeight <= 0) {
		    	divContainer.empty().append(document.createTextNode("PDF page width or height are invalid"));
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

	    	if (wantWidth != canvas.width()) {
	    		canvas.width( wantWidth );
	    	}
	    	
	    	if (wantWidth != divContainer.width()) {
	    		divContainer.width(wantWidth);
	    	}
		    
	    	// Height can be overridden by user
	    	var userHeight = parseInt(divContainer.data('height'), 10);
	    	if (!isNaN(userHeight) && userHeight > 0 && userHeight < wantHeight) {
	    		wantHeight = userHeight;
	    	}
		    
		    if (divContainer.height() != wantHeight + 4) {
		    	divContainer.height(wantHeight + 4);
		    }
		    if (canvas.height() != pageHeight * scale) {
		    	canvas.height(pageHeight * scale);
		    }
		    
		    
		      var viewport = page.getViewport(scale);
		      canvas[0].height = viewport.height;
		      canvas[0].width = viewport.width;
	
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
			      if (divContainer.data('pageNumPending') !== null) {
			          // New page rendering is pending
			    	  $.fn.pdfEmbedder.renderPage(divContainer, divContainer.data('pageNumPending'));
			    	  divContainer.data('pageNumPending', null);
			      }
		      });
	    });

	    // Update page counters
//	    document.getElementById('page_num').textContent = pageNum;

    };
    
    $.fn.pdfEmbedder.queueRenderPage = function(divContainer, num) {
        if (divContainer.data('pageRendering')) {
        	divContainer.data('pageNumPending', num);
        } else {
        	$.fn.pdfEmbedder.renderPage(divContainer, num);
        }
      };
    
    $.fn.pdfEmbedder.addToolbar = function(divContainer, atTop, showIsSecure){
    	
    	var toolbar = $('<div></div>', {'class': 'pdfemb-toolbar '+(atTop ? ' pdfemb-toolbar-top' : 'pdfemb-toolbar-bottom')});
    	var prevbtn = $('<button>Prev</button>', {'class': "pdfemb-prev"});
    	toolbar.append(prevbtn);
    	var nextbtn = $('<button>Next</button>', {'class': "pdfemb-next"});
    	toolbar.append(nextbtn);
    	
    	if (showIsSecure) {
	    	toolbar.append($('<span>Secure</span>'));
	    }
    	
    	//<span>Page: <span id="page_num"></span> / <span id="page_count"></span></span></div>
    	
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
    	
    	divContainer.on('mouseenter', function(e) {
	    		var toolbar = divContainer.find('div.pdfemb-toolbar');
	    		toolbar.show();
	    	}
    	);
    	divContainer.on('mouseleave',
	    	function(e) {
	    		var toolbar = divContainer.find('div.pdfemb-toolbar');
	    		toolbar.hide();
	    	}
		);

    };

    // Apply plugin to relevant divs/};
	
	PDFJS.workerSrc = pdfemb_trans.worker_src;
	$('.pdfemb-viewer').pdfEmbedder();
	
});

