=== Plugin Name ===
Contributors: danlester
Tags: doc, docx, pdf, office, powerpoint, google, document, embed, intranet
Requires at least: 3.3
Tested up to: 4.1
Stable tag: 1.0.1
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Embed PDFs straight into your posts and pages, with intelligent resizing of width and height. No third-party services required. 

== Description ==

Upload PDFs and embed them straight into your site - just like adding images! PDFs will be automatically sized to their natural size and shape (or just fill the width available if they are too big). Optionally, you can specify a width and the correct height will be calculated automatically. The shape will be recalculated if the page is resized by the user.

The plugin has a unique method for embedding PDFs, using Javascript only, and _not_ using iframes or third-party services. This gives a lot of flexibility over the appearance of your document, and for development of the viewer going forward.

The viewer currently has Next/Prev buttons to page through the document, and more viewer functionality will follow. There is no button to download the entire PDF (but of course a savvy user will be able to obtain the content since it is displayed to them).

It uses a customized version of Mozilla's PDF.js project, but embeds it within your existing WordPress pages so we have full control over appearance. Other plugins may use similar technology, but they will insert the PDF itself into an 'iframe' which means they do not get the flexibility over sizing.

= Usage =

Once installed and Activated, click Add Media from any page or post, just like adding an image, but drag and drop a PDF file instead.

When you insert into your post, it will appear in the editor as a 'shortcode' as follows:

[pdf-embedder url="https://mysite.com/wp-content/uploads/2015/01/Plan-Summary.pdf"]

You can optionally override width and height as follows:

[pdf-embedder url="https://mysite.com/wp-content/uploads/2015/01/Plan-Summary.pdf" width="500" height="700"]

Note the default values for width and height are "auto" (i.e. if omitted).

If you enter a fixed width (as a number), and leave height as auto, then height will be calculated automatically so the document fits. 
If you also specify a fixed height, the document may be cut off vertically and will need to be scrolled to see the whole page.


== Screenshots ==

1. Uploaded PDF is displayed within your page/post at the correct size to fit. 
2. User hovers over document to see Next/Prev page butons.

== Frequently Asked Questions ==

= How can I obtain support for this product? =

Please feel free to email [support@wp-glogin.com](mailto:support@wp-glogin.com) with any questions (specifying PDF Embedder in the subject).

Always include your full shortcode, plus links to the relevant pages, and screenshots if they would be helpful too. 

We may occasionally be able to respond to support queries posted on the 'Support' forum here on the wordpress.org
plugin page, but we recommend sending us an email instead if possible.

== Installation ==

Easiest way:

1. Go to your WordPress admin control panel's plugin page
1. Search for 'PDF Embedder'
1. Click Install
1. Click Activate on the plugin

If you cannot install from the WordPress plugins directory for any reason, and need to install from ZIP file:

1. Upload directory and contents to the `/wp-content/plugins/` directory, or upload the ZIP file directly in
the Plugins section of your Wordpress admin
1. Follow the instructions from step 4 above

== Changelog ==

= 1.0.1 =

Added usage instructions within the settings page.

= 1.0 =
First version
