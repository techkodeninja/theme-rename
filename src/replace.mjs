import casex    from "casex";
import replace  from "replace-in-file";
import path     from "path";

const themeRoot = process.cwd();

/**
 * Right-aligns the tag to match the longest one in DocBlocks and `style.css`.
 */
const padRight = ( tag, maxLength ) => tag.padEnd( maxLength );

/**
 * Maximum length for alignment in DocBlocks (`@license` is the longest here)
 */
const maxTagLength = Math.max(
	"@package".length,
	"@license".length,
	"@link".length
);

/**
 * Maximum length for alignment in `style.css`.
 */
const maxCssLength = Math.max(
	"Theme Name:".length,
	"Theme URI:".length,
	"Author:".length,
	"Author URI:".length,
	"Description:".length,
	"Text Domain:".length
);

const doReplacePhp = async ( conf, ignoreFile ) => {
	return {
		allowEmptyPaths : true,
		ignore          : [
			"vendor/**/*",
			"node_modules/**/*",
			".git/**/*",
			ignoreFile
		],

		files : [
			`${themeRoot}/**/*.php`,
			`${themeRoot}/*.js`,
			`${themeRoot}/webpack.*.js`,
			`${themeRoot}/public/views/**/*.php`
		],

		from : [
			// ✅ Namespace Replacement
			new RegExp( `namespace ${casex( conf.from.Name, 'CaSe' )}`, "g" ),

			// ✅ Package Replacement (align with other tags)
			new RegExp( `(@package\\s+)(\\s*)${casex( conf.from.Name, 'CaSe' )}`, "g" ),

			// ✅ Variable Replacement
			new RegExp( `\\$${casex( conf.from.Name.toLowerCase(), 'ca_se' )}`, "g" ),

			// ✅ Path Replacement
			new RegExp( `${casex( conf.from.Name.toLowerCase(), 'ca_se' )}/`, "g" ),

			// ✅ URI Replacement
			new RegExp( conf.from.Uri, "g" ),
			new RegExp( conf.from.AuthorUri, "g" ),

			// ✅ Author Information
			new RegExp( conf.from.AuthorEmail, "g" ),
			new RegExp( conf.from.Author, "g" ),

			// ✅ Copyright Replacement (Match any year)
			new RegExp( `@copyright\\s+([0-9]{4})\\s+${conf.from.Author}`, "g" ),
			new RegExp( `©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g" ),

			// ✅ If there is no year, just the author
			new RegExp( `©\\s+${conf.from.Author}`, "g" )
		],

		to : [
			// ✅ Namespace Replacement
			`namespace ${casex( conf.to.Name, 'CaSe' )}`,

			// ✅ Package Replacement with alignment
			`${padRight( "@package", maxTagLength )} ${casex( conf.to.Name, 'CaSe' )}`,

			// ✅ Variable Replacement
			`\$${casex( conf.to.Name.toLowerCase(), 'ca_se' )}`,

			// ✅ Path Replacement
			`${casex( conf.to.Name.toLowerCase(), 'ca_se' )}/`,

			// ✅ URI Replacement
			conf.to.Uri,
			conf.to.AuthorUri,

			// ✅ Author Information
			conf.to.AuthorEmail,
			conf.to.Author,

			// ✅ Copyright Replacement
			`${padRight( "@copyright", maxTagLength )} ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`
		]
	};
};

const doReplaceStyleCss = async ( conf ) => {
	return {
		allowEmptyPaths : true,

		files : [
			`${themeRoot}/style.css`
		],

		from : [
			new RegExp( `(Theme Name:\\s+).*`, "g" ),
			new RegExp( `(Theme URI:\\s+).*`, "g" ),
			new RegExp( `(Author:\\s+).*`, "g" ),
			new RegExp( `(Author URI:\\s+).*`, "g" ),
			new RegExp( `(Description:\\s+).*`, "g" ),
			new RegExp( `(Text Domain:\\s+).*`, "g" )
		],

		to : [
			// ✅ Perfect alignment with padding
			`${padRight( "Theme Name:", maxCssLength )}   ${casex( conf.to.Name, 'CaSe' )}`,
			`${padRight( "Theme URI:", maxCssLength )}    ${conf.to.Uri}`,
			`${padRight( "Author:", maxCssLength )}       ${conf.to.Author}`,
			`${padRight( "Author URI:", maxCssLength )}   ${conf.to.AuthorUri}`,
			`${padRight( "Description:", maxCssLength )}  ${conf.to.Description}`,
			`${padRight( "Text Domain:", maxCssLength )}  ${casex( conf.to.Name, 'ca-se' ).toLowerCase()}`
		]
	};
};

export default async ( config, ignoreFile ) => {
	const replacePhp = await doReplacePhp( config, ignoreFile );
	await replace( replacePhp );

	console.log( "\nAll PHP, JS, and webpack files updated successfully." );

	const replaceStyleCss = await doReplaceStyleCss( config );
	await replace( replaceStyleCss );

	console.log( "\nstyle.css updated successfully." );
};
