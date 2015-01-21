<?php

/**
 * Plugin Name: PDF Embedder
 * Plugin URI: http://wp-glogin.com/pdf-embedder
 * Description: Embed PDFs straight into your posts and pages, with flexible width and height. No third-party services required. 
 * Version: 1.0
 * Author: Dan Lester
 * Author URI: http://wp-glogin.com/
 * License: GPL3
 */

require_once( plugin_dir_path(__FILE__).'/core/core_pdf_embedder.php' );

class pdfemb_basic_pdf_embedder extends core_pdf_embedder {
	
	// Singleton
	private static $instance = null;
	
	public static function get_instance() {
		if (null == self::$instance) {
			self::$instance = new self;
		}
		return self::$instance;
	}
	
	// Basic specific
	
	protected function get_extra_js_name() {
		return 'basic';
	}
	
	// ADMIN
	
	protected function get_options_name() {
		return 'pdfemb_basic';
	}
	
	protected function pdfemb_mainsection_text() {
		?>
		<p>There are no settings to configure in this free version of PDF Embedder.</p>
		<?php
	}
	
	// Don't need a submit button here
	protected function pdfemb_options_submit() {
	}
	
	// AUX
	
	protected function my_plugin_basename() {
		$basename = plugin_basename(__FILE__);
		if ('/'.$basename == __FILE__) { // Maybe due to symlink
			$basename = basename(dirname(__FILE__)).'/'.basename(__FILE__);
		}
		return $basename;
	}
	
	protected function my_plugin_url() {
		$basename = plugin_basename(__FILE__);
		if ('/'.$basename == __FILE__) { // Maybe due to symlink
			return plugins_url().'/'.basename(dirname(__FILE__)).'/';
		}
		// Normal case (non symlink)
		return plugin_dir_url( __FILE__ );
	}
	
}

// Global accessor function to singleton
function pdfembPDFEmbedder() {
	return pdfemb_basic_pdf_embedder::get_instance();
}

// Initialise at least once
pdfembPDFEmbedder();

?>