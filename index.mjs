import path from "node:path";
import { loadConfig, validateConfig } from "./src/config.mjs";
import { renameTheme } from "./src/replace.mjs";

export { loadConfig, validateConfig, renameTheme };

/**
 * Renames the theme that `configPath` (a themerename.json file) lives in.
 * Throws on invalid config instead of exiting, so it can be used as a library.
 *
 * @param {string}  configPath
 * @param {object}  [options]
 * @param {string}  [options.root]   Theme root; defaults to the config's folder.
 * @param {boolean} [options.dryRun] Report changes without writing.
 * @returns {Promise<string[]>} Theme-relative paths of changed files.
 */
export default async ( configPath, { root, dryRun = false } = {} ) => {
	const config = await loadConfig( configPath );
	return renameTheme( {
		root   : root ?? path.dirname( path.resolve( configPath ) ),
		config,
		dryRun
	} );
};
