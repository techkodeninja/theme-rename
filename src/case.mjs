/**
 * Small case helpers (replaces the `casex` dependency).
 */

/**
 * Splits a string into words on spaces, dashes, underscores and camelCase humps.
 */
export const words = ( str ) =>
	String( str )
		.replace( /([a-z0-9])([A-Z])/g, "$1 $2" )
		.replace( /([A-Z]+)([A-Z][a-z])/g, "$1 $2" )
		.split( /[^A-Za-z0-9]+/ )
		.filter( Boolean );

/** "new theme" → "NewTheme" */
export const pascal = ( str ) =>
	words( str ).map( ( w ) => w.charAt( 0 ).toUpperCase() + w.slice( 1 ) ).join( "" );

/** "New Theme" → "new_theme", "NewTheme" → "newtheme" (lower-cased first, as before) */
export const snake = ( str ) => words( String( str ).toLowerCase() ).join( "_" );

/** "New Theme" → "new-theme", "NewTheme" → "newtheme" (lower-cased first, as before) */
export const kebab = ( str ) => words( String( str ).toLowerCase() ).join( "-" );

/** Escapes a string for literal use inside a RegExp. */
export const escapeRegExp = ( str ) => String( str ).replace( /[.*+?^${}()|[\]\\/]/g, "\\$&" );
