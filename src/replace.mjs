import casex    from "casex";
import replace  from "replace-in-file";
import path     from "path";

const themeRoot = process.cwd();

const padRight = ( tag, maxLength ) => tag.padEnd( maxLength );

const maxTagLength = Math.max(
	"@package".length,
	"@license".length,
	"@link".length
);

const doReplacePhp = async ( conf, ignoreFile ) => {
	return {
		allowEmptyPaths: true,
		ignore: [
			`vendor/**/*`,
			`node_modules/**/*`,
			`.git/**/*`,
			ignoreFile
		],

		files: [
			`${themeRoot}/**/*.php`,
			`${themeRoot}/*.js`,
			`${themeRoot}/webpack.*.js`,
			`${themeRoot}/public/views/**/*.php`
		],

		from: [
			new RegExp( `namespace ${casex( conf.from.Name, 'CaSe' )}`, "g" ),
			new RegExp( `(@package\\s+)(\\s*)${casex( conf.from.Name, 'CaSe' )}`, "g" ),
			new RegExp( `\\$${casex( conf.from.Name.toLowerCase(), 'ca_se' )}`, "g" ),
			new RegExp( `${casex( conf.from.Name.toLowerCase(), 'ca_se' )}/`, "g" ),
			new RegExp( conf.from.Uri, "g" ),
			new RegExp( conf.from.AuthorUri, "g" ),
			new RegExp( conf.from.AuthorEmail, "g" ),
			new RegExp( conf.from.Author, "g" ),
			new RegExp( `@copyright\\s+([0-9]{4})\\s+${conf.from.Author}`, "g" ),
			new RegExp( `©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g" ),
			new RegExp( `©\\s+${conf.from.Author}`, "g" )
		],

		to: [
			`namespace ${casex( conf.to.Name, 'CaSe' )}`,
			`${padRight( "@package", maxTagLength )} ${casex( conf.to.Name, 'CaSe' )}`,
			`\$${casex( conf.to.Name.toLowerCase(), 'ca_se' )}`,
			`${casex( conf.to.Name.toLowerCase(), 'ca_se' )}/`,
			conf.to.Uri,
			conf.to.AuthorUri,
			conf.to.AuthorEmail,
			conf.to.Author,
			`${padRight( "@copyright", maxTagLength )} ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`
		]
	};
};

const doReplaceStyleCss = async ( conf ) => {
	return {
		allowEmptyPaths: true,
		files: [
			`${themeRoot}/style.css`
		],

		from: [
			new RegExp( `(Theme Name:\\s+).*`, "g" ),
			new RegExp( `(Theme URI:\\s+).*`, "g" ),
			new RegExp( `(Description:\\s+).*`, "g" ),
			new RegExp( `(Text Domain:\\s+).*`, "g" )
		],

		to: [
			`Theme Name:     ${casex( conf.to.Name, 'CaSe' )}`,
			`Theme URI:      ${conf.to.Uri}`,
			`Description:    ${conf.to.Description}`,
			`Text Domain:    ${casex( conf.to.Name, 'ca-se' ).toLowerCase()}`
		]
	};
};

export default async ( config, ignoreFile ) => {
	const replacePhp = await doReplacePhp( config, ignoreFile );
	await replace( replacePhp );

	console.log( "\n\nPHP, JS, and webpack files updated successfully.\n\n" );

	const replaceStyleCss = await doReplaceStyleCss( config );
	await replace( replaceStyleCss );

	console.log( "\n\nstyle.css updated successfully.\n\n" );
};
