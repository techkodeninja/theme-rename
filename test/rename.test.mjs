import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { kebab, pascal, snake } from "../src/case.mjs";
import { validateConfig } from "../src/config.mjs";
import { renameTheme } from "../src/replace.mjs";

const CLI = fileURLToPath( new URL( "../bin/cli.mjs", import.meta.url ) );

const CONFIG = {
	from : {
		Name        : "ExampleTheme",
		Description : "ExampleTheme is a modern starter theme built for ClassicPress.",
		Uri         : "https://example.com/themes/exampletheme",
		Author      : "John Doe",
		AuthorEmail : "john.doe@example.com",
		AuthorUri   : "https://example.com",
		Year        : "2024"
	},
	to : {
		Name        : "NewTheme",
		Description : "NewTheme is a high-performance theme for ClassicPress.",
		Uri         : "https://new.dev/themes/newtheme",
		Author      : "Jane Smith",
		AuthorEmail : "jane+themes@new.dev",
		AuthorUri   : "https://new.dev",
		Year        : "2026"
	}
};

const FILES = {
	"functions.php" : `<?php
/**
 * @package   ExampleTheme
 * @author    John Doe <john.doe@example.com>
 * @copyright 2024 John Doe
 * @license   https://www.gnu.org/licenses/gpl-2.0.html
 * @link      https://example.com/themes/exampletheme
 */
namespace ExampleTheme;

use ExampleTheme\\Setup\\Menus;

define( 'EXAMPLETHEME_VERSION', '1.0.0' );
$exampletheme_options = new \\ExampleTheme\\Options();
function exampletheme_setup() {
	load_theme_textdomain( 'exampletheme' );
	echo __( "Hello", "exampletheme" );
	require get_template_directory() . '/exampletheme/inc.php';
}
// Unrelated URL that only looks similar: https://exampleXcom/other
// Mentions ExampleThemes (plural) and MyExampleTheme should stay.
`,
	"style.css" : `/*
* Theme Name:   ExampleTheme
* Theme URI:    https://example.com/themes/exampletheme
* Author:       John Doe
* Author URI:   https://example.com
* Description:  ExampleTheme is a modern starter theme built for ClassicPress.
* Version:      1.0.0
* Text Domain:  exampletheme
*/
.footer::after { content: "© 2024 John Doe"; }
/* Description: this later comment must not be touched */
`,
	"src/js/app.js"       : "// © John Doe\nconst domain = 'exampletheme';\n",
	"src/scss/main.scss"  : "// Author: John Doe <john.doe@example.com>\n",
	"composer.json"       : "{\n  \"autoload\": { \"psr-4\": { \"ExampleTheme\\\\\": \"app/\" } }\n}\n",
	"vendor/lib.php"      : "<?php // John Doe\n",
	"dist/app.min.js"     : "/* John Doe */\n",
	"keep/notes.txt"      : "John Doe\n",
	"skip.php.ignore"     : "John Doe\n"
};

const makeTheme = async () => {
	const dir = await mkdtemp( path.join( os.tmpdir(), "theme-rename-" ) );
	for ( const [ rel, content ] of Object.entries( FILES ) ) {
		const full = path.join( dir, rel );
		await mkdir( path.dirname( full ), { recursive: true } );
		await writeFile( full, content );
	}
	await writeFile( path.join( dir, "themerename.json" ), JSON.stringify( { ...CONFIG, ignore: [ "keep/" ] }, null, 2 ) );
	return dir;
};

const read = ( dir, rel ) => readFile( path.join( dir, rel ), "utf8" );

describe( "case helpers", () => {
	test( "convert names", () => {
		assert.equal( pascal( "new theme" ), "NewTheme" );
		assert.equal( pascal( "NewTheme" ), "NewTheme" );
		assert.equal( snake( "New Theme" ), "new_theme" );
		assert.equal( snake( "NewTheme" ), "newtheme" );
		assert.equal( kebab( "New Theme" ), "new-theme" );
	} );
} );

describe( "validateConfig", () => {
	test( "accepts a complete config", () => {
		assert.doesNotThrow( () => validateConfig( structuredClone( CONFIG ) ) );
	} );

	test( "rejects a from field with no matching to field", () => {
		const conf = structuredClone( CONFIG );
		delete conf.to.AuthorUri;
		assert.throws( () => validateConfig( conf ), /to\.AuthorUri/ );
	} );

	test( "rejects empty values", () => {
		const conf = structuredClone( CONFIG );
		conf.from.Author = "";
		assert.throws( () => validateConfig( conf ), /from\.Author/ );
	} );

	test( "requires Name in both blocks", () => {
		assert.throws( () => validateConfig( { from: {}, to: { Name: "X" } } ), /from\.Name/ );
	} );
} );

describe( "renameTheme", () => {
	let dir;
	let changed;

	before( async () => {
		dir     = await makeTheme();
		changed = await renameTheme( { root: dir, config: { ...CONFIG, ignore: [ "keep/" ] } } );
	} );

	after( () => rm( dir, { recursive: true, force: true } ) );

	test( "reports only the files it changed", () => {
		assert.deepEqual( changed, [ "composer.json", "functions.php", "src/js/app.js", "src/scss/main.scss", "style.css" ] );
	} );

	test( "rewrites PHP namespaces, prefixes, docblocks and text domains", async () => {
		const php = await read( dir, "functions.php" );
		assert.match( php, /@package   NewTheme\n/ );
		assert.match( php, /@author    Jane Smith <jane\+themes@new\.dev>/ );
		assert.match( php, /@copyright 2026 Jane Smith/ );
		assert.match( php, /@link      https:\/\/new\.dev\/themes\/newtheme/ );
		assert.match( php, /^namespace NewTheme;$/m );
		assert.match( php, /^use NewTheme\\Setup\\Menus;$/m );
		assert.match( php, /new \\NewTheme\\Options\(\)/ );
		assert.match( php, /'NEWTHEME_VERSION'/ );
		assert.match( php, /\$newtheme_options/ );
		assert.match( php, /function newtheme_setup\(\)/ );
		assert.match( php, /load_theme_textdomain\( 'newtheme' \)/ );
		assert.match( php, /__\( "Hello", "newtheme" \)/, "keeps double quotes" );
		assert.match( php, /'\/newtheme\/inc\.php'/ );
	} );

	test( "does not touch look-alike text", async () => {
		const php = await read( dir, "functions.php" );
		assert.match( php, /https:\/\/exampleXcom\/other/ );
		assert.match( php, /ExampleThemes \(plural\) and MyExampleTheme/ );
	} );

	test( "rewrites the style.css header but nothing below it", async () => {
		const css = await read( dir, "style.css" );
		assert.match( css, /^\* Theme Name:   NewTheme$/m );
		assert.match( css, /^\* Theme URI:    https:\/\/new\.dev\/themes\/newtheme$/m );
		assert.match( css, /^\* Author:       Jane Smith$/m );
		assert.match( css, /^\* Author URI:   https:\/\/new\.dev$/m );
		assert.match( css, /^\* Description:  NewTheme is a high-performance theme for ClassicPress\.$/m );
		assert.match( css, /^\* Text Domain:  newtheme$/m );
		assert.match( css, /^\* Version:      1\.0\.0$/m );
		assert.match( css, /"© 2026 Jane Smith"/ );
		assert.match( css, /Description: this later comment must not be touched/ );
	} );

	test( "handles JS, SCSS and composer.json", async () => {
		assert.equal( await read( dir, "src/js/app.js" ), "// © 2026 Jane Smith\nconst domain = 'newtheme';\n" );
		assert.equal( await read( dir, "src/scss/main.scss" ), "// Author: Jane Smith <jane+themes@new.dev>\n" );
		assert.match( await read( dir, "composer.json" ), /"NewTheme\\\\": "app\/"/ );
	} );

	test( "skips vendor, minified, *.ignore, configured ignores and the config itself", async () => {
		assert.equal( await read( dir, "vendor/lib.php" ), FILES[ "vendor/lib.php" ] );
		assert.equal( await read( dir, "dist/app.min.js" ), FILES[ "dist/app.min.js" ] );
		assert.equal( await read( dir, "skip.php.ignore" ), FILES[ "skip.php.ignore" ] );
		assert.equal( await read( dir, "keep/notes.txt" ), FILES[ "keep/notes.txt" ] );
		assert.match( await read( dir, "themerename.json" ), /John Doe/ );
	} );

	test( "is a no-op when run a second time", async () => {
		assert.deepEqual( await renameTheme( { root: dir, config: { ...CONFIG, ignore: [ "keep/" ] } } ), [] );
	} );

	test( "does not interpret $ in replacement values", async () => {
		const tmp = await mkdtemp( path.join( os.tmpdir(), "theme-rename-" ) );
		await writeFile( path.join( tmp, "a.php" ), "John Doe\n" );
		await renameTheme( { root: tmp, config: { from: { Name: "A", Author: "John Doe" }, to: { Name: "B", Author: "Cash $& Co" } } } );
		assert.equal( await read( tmp, "a.php" ), "Cash $& Co\n" );
		await rm( tmp, { recursive: true, force: true } );
	} );
} );

describe( "cli", () => {
	let dir;

	before( async () => {
		dir = await makeTheme();
	} );

	after( () => rm( dir, { recursive: true, force: true } ) );

	const run = ( ...args ) => spawnSync( process.execPath, [ CLI, ...args ], { encoding: "utf8", cwd: os.tmpdir() } );

	test( "--dry-run lists files without writing", async () => {
		const result = run( dir, "--dry-run" );
		assert.equal( result.status, 0, result.stderr );
		assert.match( result.stdout, /would update {2}functions\.php/ );
		assert.equal( await read( dir, "functions.php" ), FILES[ "functions.php" ] );
	} );

	test( "uses the theme-dir argument as the root, not the cwd", async () => {
		const result = run( dir, "--force" );
		assert.equal( result.status, 0, result.stderr );
		assert.match( await read( dir, "functions.php" ), /namespace NewTheme;/ );
	} );

	test( "refuses to run on a dirty git tree without --force", async () => {
		const repo = await makeTheme();
		const git  = ( ...a ) => spawnSync( "git", a, { cwd: repo } );
		if ( git( "init", "-q" ).status !== 0 ) {
			return; // git not installed
		}
		const result = run( repo );
		assert.equal( result.status, 1 );
		assert.match( result.stderr, /uncommitted git changes/ );
		assert.equal( await read( repo, "functions.php" ), FILES[ "functions.php" ] );
		await rm( repo, { recursive: true, force: true } );
	} );

	test( "reports a clear error for an invalid config", async () => {
		const bad = await mkdtemp( path.join( os.tmpdir(), "theme-rename-" ) );
		await writeFile( path.join( bad, "themerename.json" ), JSON.stringify( { from: { Name: "A", Uri: "x" }, to: { Name: "B" } } ) );
		const result = run( bad );
		assert.equal( result.status, 1 );
		assert.match( result.stderr, /to\.Uri/ );
		await rm( bad, { recursive: true, force: true } );
	} );

	test( "--help and --version", () => {
		assert.match( run( "--help" ).stdout, /Usage: theme-rename/ );
		assert.match( run( "--version" ).stdout, /^\d+\.\d+\.\d+/ );
	} );
} );
