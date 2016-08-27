/*global jQuery:false*/

/*! Copyright 2012, Ben Lin (http://dreamerslab.com/)
* Licensed under the MIT License (LICENSE.txt).
*
* Version: 1.0.15
*
* Requires: jQuery >= 1.2.3
*/

/*
// get hidden element actual width
$( '.hidden' ).actual( 'width' );

// get hidden element actual innerWidth
$( '.hidden' ).actual( 'innerWidth' );

// get hidden element actual outerWidth
$( '.hidden' ).actual( 'outerWidth' );

// get hidden element actual outerWidth and set the `includeMargin` argument
$( '.hidden' ).actual( 'outerWidth', { includeMargin : true });

// get hidden element actual height
$( '.hidden' ).actual( 'height' );

// get hidden element actual innerHeight
$( '.hidden' ).actual( 'innerHeight' );

// get hidden element actual outerHeight
$( '.hidden' ).actual( 'outerHeight' );

// get hidden element actual outerHeight and set the `includeMargin` argument
$( '.hidden' ).actual( 'outerHeight', { includeMargin : true });

// if the page jumps or blinks, pass a attribute '{ absolute : true }'
// be very careful, you might get a wrong result depends on how you makrup your html and css
$( '.hidden' ).actual( 'height', { absolute : true });

// if you use css3pie with a float element
// for example a rounded corner navigation menu you can also try to pass a attribute '{ clone : true }'
// please see demo/css3pie in action
$( '.hidden' ).actual( 'width', { clone : true });
*/

(function ($){
'use strict';

$.fn.addBack = $.fn.addBack || $.fn.andSelf;

$.fn.extend({

	actual : function ( method, options ){
		// check if the jQuery method exist
		if( !this[ method ]){
			throw '$.actual => The jQuery method "' + method + '" you called does not exist';
		}

		var defaults = {
			absolute      : false,
			clone         : false,
			includeMargin : false
		};

		var configs = $.extend( defaults, options );

		var $target = this.eq( 0 );
		var fix, restore;

		if ( configs.clone === true ){
			fix = function (){
				var style = 'position: absolute !important; top: -1000 !important; ';

				// this is useful with css3pie
				$target = $target.
					clone().
					attr( 'style', style ).
					appendTo( 'body' );
			};

			restore = function (){
				// remove DOM element after getting the width
				$target.remove();
			};
		}
		else {
			var tmp   = [];
			var style = '';
			var $hidden;

			fix = function (){
				// get all hidden parents
				$hidden = $target.parents().addBack().filter( ':hidden' );
				style   += 'visibility: hidden !important; display: block !important; ';

				if( configs.absolute === true ) style += 'position: absolute !important; ';

				// save the origin style props
				// set the hidden el css to be got the actual value later
				$hidden.each( function (){
					var $this = $( this );

					// Save original style. If no style was set, attr() returns undefined
					tmp.push( $this.attr( 'style' ));
					$this.attr( 'style', style );
				});
			};

			restore = function (){
				// restore origin style values
				$hidden.each( function ( i ){
					var $this = $( this );
					var _tmp  = tmp[ i ];

					if( _tmp === undefined ){
						$this.removeAttr( 'style' );
					}else{
						$this.attr( 'style', _tmp );
					}
				});
			};
		}

		fix();
		// get the actual value with user specific methed
		// it can be 'width', 'height', 'outerWidth', 'innerWidth'... etc
		// configs.includeMargin only works for 'outerWidth' and 'outerHeight'
		var actual = /(outer)/.test( method ) ?
			$target[ method ]( configs.includeMargin ) :
			$target[ method ]();

		restore();
		// IMPORTANT, this plugin only return the value of the first element
		return actual;
	}
});
})(jQuery);