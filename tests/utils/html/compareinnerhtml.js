/* bender-tags: editor,unit,utils */

( function() {
	'use strict';

	var compatHtmlArgs,
		originalCompatHtml = bender.tools.compatHtml,
		htmlTools = bender.tools.html;

	bender.tools.compatHtml = function( html, noInterWS, sortAttributes, fixZWS, fixStyles, fixNbsp ) {
		compatHtmlArgs = {
			noInterWS: !!noInterWS,
			sortAttributes: !!sortAttributes,
			fixZWS: !!fixZWS,
			fixStyles: !!fixStyles,
			fixNbsp: !!fixNbsp
		};

		return originalCompatHtml.call( bender.tools, html, noInterWS, sortAttributes, fixZWS, fixStyles, fixNbsp );
	};

	function t( ret, expected, actual, options, expectedCompatHtmlArgs ) {
		return function() {
			// In case compatHtml was not called at all.
			compatHtmlArgs = {};
			assert.areSame( ret, htmlTools.compareInnerHtml( expected, actual, options ), 'returned value' );

			if ( expectedCompatHtmlArgs ) {
				for ( var arg in expectedCompatHtmlArgs ) {
					assert.areSame( expectedCompatHtmlArgs[ arg ], compatHtmlArgs[ arg ],
						'compatHtml\'s argument: ' + arg );
				}
			}
		};
	}

	bender.test( {
		// Options ------------------------------------------------------------

		'opts.noInterWS defaults to false':			t( true, '', '', null, { noInterWS: false } ),
		'opts.noInterWS defaults to false 2':		t( true, '', '', {}, { noInterWS: false } ),
		'opts.noInterWS is passed':					t( true, '', '', { noInterWS: true }, { noInterWS: true } ),

		'opts.fixStyles defaults to false':			t( true, '', '', null, { fixStyles: false } ),
		'opts.fixStyles is passed':					t( true, '', '', { fixStyles: true }, { fixStyles: true } ),

		'opts.sortAttributes defaults to true':		t( true, '', '', null, { sortAttributes: true } ),
		'opts.fixZWS defaults to true':				t( true, '', '', null, { fixZWS: true } ),
		'opts.fixNbsp defaults to true':			t( true, '', '', null, { fixNbsp: true } ),

		'multiple opts':							t( true, '', '', { fixNbsp: false, fixStyles: true }, { fixZWS: true, fixNbsp: false, fixStyles: true } ),

		// Passing ------------------------------------------------------------

		'simple string':									t( true, 'foo', 'foo' ),
		'simple element':									t( true, '<b>foo</b>', '<B>foo</B>' ),
		'bogus expected, not exists':						t( true, 'a@', 'a' ),
		'bogus expected, exists':							t( true, 'a@', 'a<br />' ),
		'multiple boguses':									t( true, '<p>a@</p><p>b@</p><p>c@</p>', '<p>a<br /></p><p>b</p><p>c<br /></p>' ),
		'regexp conflict [':								t( true, 'ba[r', 'ba[r' ),

		'markers 1 - no opts.compareSelection':				t( true, 'ba[r]', 'ba[r]' ),
		'markers 2 - no opts.compareSelection':				t( true, 'ba{}r', 'ba{}r' ),
		'markers 3 - no opts.compareSelection':				t( true, '<ul><li>[</li><li>a</li></ul>', '<ul>[<li>a</li></ul>' ),

		'markers 1 - opts.compareSelection':				t( true, 'ba[r}', 'ba[r}', { compareSelection: true } ),
		'markers 2 - opts.compareSelection':				t( true, 'ba{}r', 'ba{}r', { compareSelection: true } ),
		'markers 3 - opts.compareSelection':				t( true, 'ba[]r', 'ba[]r', { compareSelection: true } ),
		'markers 4 - opts.compareSelection':				t( true, '<ul>[<li>a</li>]</ul>', '<ul>[<li>a</li>]</ul>', { compareSelection: true } ),

		'markers 1 - opts.compare&normalizeSelection':		t( true, 'ba[r]', 'ba{r}', { compareSelection: true, normalizeSelection: true } ),
		'markers 2 - opts.compare&normalizeSelection':		t( true, 'ba^r', 'ba{}r', { compareSelection: true, normalizeSelection: true } ),
		'markers 3 - opts.compare&normalizeSelection':		t( true, 'ba^r', 'ba[]r', { compareSelection: true, normalizeSelection: true } ),
		'markers 4 - opts.compare&normalizeSelection':		t( true, '<ul>[<li>a</li>]</ul>', '<ul>[<li>a</li>]</ul>', { compareSelection: true, normalizeSelection: true } ),

		// Failing ------------------------------------------------------------

		'simple string - fail':								t( false, 'foo', 'bar' ),
		'simple element - fail':							t( false, '<b>foo</b>', '<I>foo</I>' ),
		'not expected bogus - fail':						t( false, '<p>foo<br /></p>', '<p>foo</p>' ),

		// Expected part has to be regexified if special characters are not escaped
		// bad things may happen.
		'regexp conflict * - fail':							t( false, 'ba*r', 'br' ),
		'regexp - partial match - start - fail':			t( false, 'bar', 'barx' ),
		'regexp - partial match - end - fail':				t( false, 'bar', 'xbar' ),

		'markers 1 - no opts.compareSelection - fail':		t( false, 'bar', 'ba[]r' ),
		'markers 2 - no opts.compareSelection - fail':		t( false, 'ba{}r', 'ba[]r' ),
		'markers - opts.compareSelection - fail':			t( false, 'ba{}r', 'ba[]r', { compareSelection: true } ),
		'markers - opts.compare&normalizeSelection - fail': t( false, 'ba[]r', 'ba[]r', { compareSelection: true, normalizeSelection: true } ),

		// Misc ---------------------------------------------------------------

		'test does not modify options object': function() {
			var opts = {
					fixStyles: true
				},
				strOpts = JSON.stringify( opts );

			htmlTools.compareInnerHtml( 'a', 'a', opts );

			assert.areSame( strOpts, JSON.stringify( opts ), 'options object has not been modified' );
		}
	} );
} )();