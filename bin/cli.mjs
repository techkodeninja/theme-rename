#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadConfig, renameTheme } from "../index.mjs";

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint    = ( code ) => ( text ) => ( useColor ? `\x1b[${code}m${text}\x1b[0m` : text );
const green    = paint( 32 );
const red      = paint( 31 );
const yellow   = paint( 33 );
const dim      = paint( 2 );

const HELP = `
Usage: theme-rename [theme-dir] [options]

Renames a ClassicPress theme using the themerename.json in its root.

Arguments:
  theme-dir            Theme root directory (default: current directory)

Options:
  -c, --config <file>  Path to the config file (default: <theme-dir>/themerename.json)
  -n, --dry-run        List the files that would change without writing them
  -f, --force          Run even if the theme's git working tree has uncommitted changes
  -h, --help           Show this help
  -v, --version        Show the version
`;

const fail = ( message ) => {
	console.error( red( `\n✖ ${message}\n` ) );
	process.exit( 1 );
};

/**
 * Returns "dirty", "clean" or "none" (not a git repo / git unavailable).
 */
const gitState = ( dir ) => {
	const result = spawnSync( "git", [ "status", "--porcelain" ], { cwd: dir, encoding: "utf8" } );
	if ( result.error || result.status !== 0 ) {
		return "none";
	}
	return result.stdout.trim() ? "dirty" : "clean";
};

let args;
try {
	args = parseArgs( {
		allowPositionals : true,
		options          : {
			config    : { type: "string", short: "c" },
			"dry-run" : { type: "boolean", short: "n", default: false },
			force     : { type: "boolean", short: "f", default: false },
			help      : { type: "boolean", short: "h", default: false },
			version   : { type: "boolean", short: "v", default: false }
		}
	} );
} catch ( error ) {
	fail( `${error.message}\n${HELP}` );
}

const { values, positionals } = args;

if ( values.help ) {
	console.log( HELP );
	process.exit( 0 );
}

if ( values.version ) {
	const pkg = JSON.parse( readFileSync( new URL( "../package.json", import.meta.url ), "utf8" ) );
	console.log( pkg.version );
	process.exit( 0 );
}

const root       = path.resolve( positionals[ 0 ] ?? process.cwd() );
const configPath = path.resolve( values.config ?? path.join( root, "themerename.json" ) );
const dryRun     = values[ "dry-run" ];

try {
	const config = await loadConfig( configPath );

	if ( !dryRun ) {
		const state = gitState( root );
		if ( state === "dirty" && !values.force ) {
			fail( "The theme has uncommitted git changes. Commit or stash them first so the rename can be reviewed and undone, or pass --force." );
		}
		if ( state === "none" ) {
			console.warn( yellow( "\n⚠ The theme is not a git repository, so these changes can't be easily undone." ) );
		}
	}

	console.log( green( `\n${dryRun ? "Dry run: " : ""}Renaming ${config.from.Name} → ${config.to.Name} in ${root}\n` ) );

	const changed = await renameTheme( { root, config, dryRun } );

	for ( const file of changed ) {
		console.log( `  ${dryRun ? "would update" : "updated"}  ${file}` );
	}

	if ( changed.length === 0 ) {
		console.log( dim( "  No files needed changes." ) );
	}

	console.log( green( `\n✔ ${changed.length} file${changed.length === 1 ? "" : "s"} ${dryRun ? "would change" : "updated"}.\n` ) );
} catch ( error ) {
	fail( error.message );
}
