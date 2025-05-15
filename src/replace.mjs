import casex from "casex";
import replace from "replace-in-file";
import path from "path";

const themeRoot = process.cwd();

/**
 * Right-aligns the tag to match the longest one (e.g., `Theme URI`)
 */
const padRight = (tag, maxLength) => tag.padEnd(maxLength);

/**
 * Maximum length for alignment (`Requires PHP` is the longest here)
 */
const maxTagLength = Math.max(
	"Theme Name".length,
	"Theme URI".length,
	"Author".length,
	"Author URI".length,
	"Description".length,
	"License".length,
	"License URI".length,
	"Tags".length,
	"Requires CP".length,
	"Requires PHP".length,
	"Version".length,
	"Text Domain".length
);

const doReplacePhp = async (conf, ignoreFile) => {
	return {
		allowEmptyPaths: true,
		ignore: [
			"vendor/**/*",
			"node_modules/**/*",
			".git/**/*",
			ignoreFile
		],
		files: [
			`${themeRoot}/**/*.php`,
			`${themeRoot}/*.js`,
			`${themeRoot}/webpack.*.js`,
			`${themeRoot}/public/views/**/*.php`,
			`${themeRoot}/style.css`  // ✅ Include style.css
		],
		from: [
			// ✅ Namespace Replacement
			new RegExp(`namespace ${casex(conf.from.Name, 'CaSe')}`, "g"),
			// ✅ Package Replacement (align with other tags)
			new RegExp(`(@package\\s+)(\\s*)${casex(conf.from.Name, 'CaSe')}`, "g"),
			// ✅ Variable Replacement
			new RegExp(`\\$${casex(conf.from.Name.toLowerCase(), 'ca_se')}`, "g"),
			// ✅ Path Replacement
			new RegExp(`${casex(conf.from.Name.toLowerCase(), 'ca_se')}/`, "g"),
			// ✅ URI Replacement
			new RegExp(conf.from.Uri, "g"),
			new RegExp(conf.from.AuthorUri, "g"),
			// ✅ Author Information
			new RegExp(conf.from.AuthorEmail, "g"),
			new RegExp(conf.from.Author, "g"),
			// ✅ Copyright Replacement (Match any year)
			new RegExp(`@copyright\\s+([0-9]{4})\\s+${conf.from.Author}`, "g"),
			new RegExp(`©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g"),
			// ✅ If there is no year, just the author
			new RegExp(`©\\s+${conf.from.Author}`, "g"),
			// ✅ WordPress style.css replacements
			new RegExp(`(Theme Name:\\s+).*`, "g"),
			new RegExp(`(Theme URI:\\s+).*`, "g"),
			new RegExp(`(Author:\\s+).*`, "g"),
			new RegExp(`(Author URI:\\s+).*`, "g"),
			new RegExp(`(Description:\\s+).*`, "g"),
			new RegExp(`(Tags:\\s+).*`, "g"),
			new RegExp(`(Requires CP:\\s+).*`, "g"),
			new RegExp(`(Requires PHP:\\s+).*`, "g"),
			new RegExp(`(Version:\\s+).*`, "g"),
			new RegExp(`(License:\\s+).*`, "g"),
			new RegExp(`(License URI:\\s+).*`, "g"),
			new RegExp(`(Text Domain:\\s+).*`, "g")
		],
		to: [
			// ✅ Namespace Replacement
			`namespace ${casex(conf.to.Name, 'CaSe')}`,
			// ✅ Package Replacement with alignment
			`${padRight("@package", maxTagLength)} ${casex(conf.to.Name, '
