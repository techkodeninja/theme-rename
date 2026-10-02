import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyRules, buildHeaderRules, buildRules } from "./rules.mjs";

/** File types that get rewritten. */
export const EXTENSIONS = new Set( [
	".php", ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
	".css", ".scss", ".sass",
	".json", ".txt", ".md", ".xml", ".yml", ".yaml", ".pot", ".po"
] );

/** Directories and files that are never touched. */
const DEFAULT_IGNORE_DIRS  = new Set( [ ".git", "node_modules", "vendor" ] );
const DEFAULT_IGNORE_FILES = new Set( [ "themerename.json", "package-lock.json", "composer.lock", "yarn.lock", "pnpm-lock.yaml" ] );

const toPosix = ( p ) => p.split( path.sep ).join( "/" );

/**
 * Returns true when a theme-relative path is excluded by the config's `ignore`
 * list (entries are paths or directory prefixes relative to the theme root).
 */
const isIgnored = ( relPath, ignore ) =>
	ignore.some( ( entry ) => {
		const clean = toPosix( entry ).replace( /^\.\//, "" ).replace( /\/+$/, "" );
		return relPath === clean || relPath.startsWith( `${clean}/` );
	} );

/**
 * Recursively lists the theme files that should be processed.
 */
export const collectFiles = async ( root, ignore = [] ) => {
	const results = [];

	const walk = async ( dir ) => {
		const entries = await readdir( dir, { withFileTypes: true } );
		for ( const entry of entries ) {
			const full = path.join( dir, entry.name );
			const rel  = toPosix( path.relative( root, full ) );

			if ( isIgnored( rel, ignore ) ) {
				continue;
			}
			if ( entry.isDirectory() ) {
				if ( !DEFAULT_IGNORE_DIRS.has( entry.name ) ) {
					await walk( full );
				}
				continue;
			}
			if (
				entry.isFile() &&
				EXTENSIONS.has( path.extname( entry.name ).toLowerCase() ) &&
				!DEFAULT_IGNORE_FILES.has( entry.name ) &&
				!entry.name.endsWith( ".ignore" ) &&
				!/\.min\.(js|css)$/.test( entry.name )
			) {
				results.push( full );
			}
		}
	};

	await walk( root );
	return results.sort();
};

/**
 * Rewrites the style.css header comment (only the first comment block, so
 * "Description:" text further down the stylesheet is left alone).
 */
const replaceStyleHeader = ( content, headerRules ) =>
	content.replace( /^[\s\S]*?\*\//, ( header ) => applyRules( header, headerRules ) );

/**
 * Renames a theme in place.
 *
 * @param {object}  options
 * @param {string}  options.root    Theme root directory.
 * @param {object}  options.config  Validated themerename.json contents.
 * @param {boolean} [options.dryRun=false] Report changes without writing.
 * @returns {Promise<string[]>} Theme-relative paths of files that changed.
 */
export const renameTheme = async ( { root, config, dryRun = false } ) => {
	const rules       = buildRules( config );
	const headerRules = buildHeaderRules( config );
	const files       = await collectFiles( root, config.ignore ?? [] );
	const changed     = [];

	for ( const file of files ) {
		const original = await readFile( file, "utf8" );
		const rel      = toPosix( path.relative( root, file ) );
		let content    = original;

		if ( rel === "style.css" ) {
			content = replaceStyleHeader( content, headerRules );
		}
		content = applyRules( content, rules );

		if ( content !== original ) {
			changed.push( rel );
			if ( !dryRun ) {
				await writeFile( file, content, "utf8" );
			}
		}
	}

	return changed;
};
