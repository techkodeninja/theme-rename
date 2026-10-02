import { escapeRegExp as esc, kebab, pascal, snake } from "./case.mjs";

/**
 * A rule is { name, pattern, replace } where `replace` is always a function so
 * that `$` characters in user values are never treated as replacement tokens.
 */
const rule = ( name, pattern, replace ) => ( { name, pattern, replace } );

/** Matches the value only when it isn't glued to other word characters. */
const bounded = ( value ) => `(?<![\\w])${esc( value )}(?![\\w])`;

/**
 * Derives the identifiers used in code from the config.
 */
export const identifiers = ( conf ) => {
	const id = ( block ) => ( {
		namespace  : conf[ block ].Namespace  ?? pascal( conf[ block ].Name ),
		textDomain : conf[ block ].TextDomain ?? kebab( conf[ block ].Name ),
		prefix     : snake( conf[ block ].Name )
	} );
	return { from: id( "from" ), to: id( "to" ) };
};

/**
 * Builds the ordered list of replacement rules applied to every theme file.
 * Order matters: more specific patterns run before the general ones that would
 * otherwise consume their text (e.g. copyright lines before the plain author).
 */
export const buildRules = ( conf ) => {
	const { from, to } = conf;
	const ids          = identifiers( conf );
	const rules        = [];

	// Copyright lines: "@copyright 2024 John Doe", "© 2024 John Doe", "Copyright 2020-2024 John Doe".
	if ( from.Author ) {
		rules.push( rule(
			"copyright",
			new RegExp( `(@copyright\\s+|©\\s*|Copyright\\s+(?:©\\s*)?)(?:(\\d{4}(?:\\s*[-–]\\s*\\d{4})?)\\s+)?${bounded( from.Author )}`, "g" ),
			( _m, prefix, year ) => {
				const newYear = to.Year ?? year;
				return `${prefix}${newYear ? `${newYear} ` : ""}${to.Author}`;
			}
		) );
	}

	// PHP namespaces: declarations, `use` imports, qualified names, @package tags and
	// composer.json PSR-4 keys ("ExampleTheme\\").
	rules.push(
		rule( "namespace-declaration", new RegExp( `(\\b(?:namespace|use)\\s+)${esc( ids.from.namespace )}(?![\\w])`, "g" ), ( _m, p ) => p + ids.to.namespace ),
		rule( "namespace-qualified", new RegExp( `(?<![\\w])${esc( ids.from.namespace )}(?=\\\\)`, "g" ), () => ids.to.namespace ),
		rule( "package-tag", new RegExp( `(@package\\s+)${esc( ids.from.namespace )}(?![\\w])`, "g" ), ( _m, p ) => p + ids.to.namespace )
	);

	// URLs, longest first so a theme URI isn't half-replaced by the author URI it starts with.
	const urls = [ "Uri", "AuthorUri" ]
		.filter( ( key ) => from[ key ] )
		.sort( ( a, b ) => from[ b ].length - from[ a ].length );
	for ( const key of urls ) {
		rules.push( rule( key, new RegExp( esc( from[ key ] ), "g" ), () => to[ key ] ) );
	}

	for ( const key of [ "AuthorEmail", "Description", "Author" ] ) {
		if ( from[ key ] ) {
			rules.push( rule( key, new RegExp( bounded( from[ key ] ), "g" ), () => to[ key ] ) );
		}
	}

	// Snake-case prefix: $exampletheme_x variables, exampletheme_setup() functions,
	// EXAMPLETHEME_VERSION constants and exampletheme/ paths.
	const fromPrefix = ids.from.prefix;
	const toPrefix   = ids.to.prefix;
	rules.push(
		rule( "variable", new RegExp( `\\$${esc( fromPrefix )}`, "g" ), () => `$${toPrefix}` ),
		rule( "prefix", new RegExp( `(?<![\\w$])${esc( fromPrefix )}_`, "g" ), () => `${toPrefix}_` ),
		rule( "constant", new RegExp( `(?<![\\w$])${esc( fromPrefix.toUpperCase() )}_`, "g" ), () => `${toPrefix.toUpperCase()}_` ),
		rule( "path", new RegExp( `(?<![\\w-])${esc( fromPrefix )}/`, "g" ), () => `${toPrefix}/` )
	);

	// Quoted text domain / slug, keeping whichever quote style was used.
	rules.push( rule(
		"text-domain",
		new RegExp( `(['"])${esc( ids.from.textDomain )}\\1`, "g" ),
		( _m, quote ) => `${quote}${ids.to.textDomain}${quote}`
	) );

	return rules;
};

/**
 * Rules for the style.css header comment. Each keeps the original label and
 * spacing and only swaps the value. Fields missing from `to` are left alone.
 */
export const buildHeaderRules = ( conf ) => {
	const { to } = conf;
	const ids    = identifiers( conf );
	const fields = {
		"Theme Name"  : to.Name,
		"Theme URI"   : to.Uri,
		"Author"      : to.Author,
		"Author URI"  : to.AuthorUri,
		"Description" : to.Description,
		"Text Domain" : ids.to.textDomain
	};

	return Object.entries( fields )
		.filter( ( [ , value ] ) => value )
		.map( ( [ label, value ] ) => rule(
			`header:${label}`,
			new RegExp( `^([ \\t*]*${esc( label )}:[ \\t]*).*$`, "gm" ),
			( _m, prefix ) => prefix + value
		) );
};

/**
 * Applies rules to a string and returns the new string.
 */
export const applyRules = ( content, rules ) =>
	rules.reduce( ( text, { pattern, replace } ) => text.replace( pattern, replace ), content );
