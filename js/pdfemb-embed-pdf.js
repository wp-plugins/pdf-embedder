
// JQuery Plugin

(function( $ ) {
 
    $.fn.pdfEmbedder = function() {
    	
    	this.each(function(index, rawDivContainer) {
    	
    		var divContainer = $(rawDivContainer);
	    	divContainer.append($('<canvas></canvas>', {class: 'the-canvas'})); //style: 'border:1px solid black', 
	    	
	    	var url = divContainer.attr('data-pdf-url');
	    	
	    	  /**
	    	   * Asynchronously downloads PDF.
	    	   */
	    	  PDFJS.getDocument(url).then(function (pdfDoc_) {
	    		divContainer.data('pdfDoc', pdfDoc_);
	    	    //document.getElementById('page_count').textContent = this.pdfDoc.numPages;
	
	    	    //$.fn.pdfEmbedder.addToolbar(divContainer, true);
	    	    $.fn.pdfEmbedder.addToolbar(divContainer, false);
	    	    
	    	 // Initial/first page rendering
	    	    divContainer.data('pageNum', 1);
	    	    divContainer.data('pageNumPending', null);
	    	    $.fn.pdfEmbedder.renderPage(divContainer, 1);
	    	    
	    	    $(window).resize(function() {
	    	    	$.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pageNum'));
	    	    });
	    	  }, 
	    	  function(e) { 
	    		  divContainer.empty().append($('<div></div>', {class: 'pdfemb-errormsg'}).append(document.createTextNode(e.message)));
	    	  });
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
		    
		    // Max out at parent container width
		    var parentWidth = divContainer.parent().width();
		    if (parentWidth < pageWidth) {
		    	scale = parentWidth / pageWidth;
		    	pageHeight = pageHeight * scale; 
		    	pageWidth = parentWidth;
		    }
		    
		    if (divContainer.data('width') == 'auto') {
		    	canvas.width( pageWidth );
		    	divContainer.width(pageWidth);
		    	scale = canvas.width() / pageWidth;
		    }
		    else {
		    	canvas.width( divContainer.width() );
		    	scale = divContainer.width() / pageWidth;
		    }
		    
		    if (divContainer.data('height') == 'auto') {
			    if (pageHeight > 0) {
			    	divContainer.height(pageHeight * scale + 4);
			    }
		    }
		    
		    canvas.height( pageHeight * scale );
		    
		    
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
    
    $.fn.pdfEmbedder.addToolbar = function(divContainer, atTop){
    	
    	var toolbar = $('<div></div>', {class: 'pdfemb-toolbar '+(atTop ? ' pdfemb-toolbar-top' : 'pdfemb-toolbar-bottom')});
    	var prevbtn = $('<button>Prev</button>', {class: "pdfemb-prev"});
    	toolbar.append(prevbtn);
    	var nextbtn = $('<button>Next</button>', {class: "pdfemb-next"});
    	toolbar.append(nextbtn);
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
 
}( jQuery ));

// Apply plugin to relevant divs/};

jQuery(document).ready(function ($) {
	
	PDFJS.workerSrc = pdfemb_trans.worker_src;
	$('.pdfemb-viewer').pdfEmbedder();
	
});

