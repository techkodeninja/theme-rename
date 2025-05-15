import casex from "casex";
import replace from "replace-in-file";
import path from "path";

const themeRoot = process.cwd();

/**
 * Right-aligns the tag to match the longest one (e.g., `@copyright`)
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
			`${padRight("@package", maxTagLength)} ${casex(conf.to.Name, 'CaSe')}`,
			// ✅ Variable Replacement
			`\$${casex(conf.to.Name.toLowerCase(), 'ca_se')}`,
			// ✅ Path Replacement
			`${casex(conf.to.Name.toLowerCase(), 'ca_se')}/`,
			// ✅ URI Replacement
			conf.to.Uri,
			conf.to.AuthorUri,
			// ✅ Author Information
			conf.to.AuthorEmail,
			conf.to.Author,
			// ✅ Copyright Replacement
			`${padRight("@copyright", maxTagLength)} ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			// ✅ WordPress style.css replacements with alignment
			`${padRight("Theme Name:", maxTagLength)}\t${casex(conf.to.Name, 'CaSe')}`,
			`${padRight("Theme URI:", maxTagLength)}\t${conf.to.Uri}`,
			`${padRight("Author:", maxTagLength)}\t${conf.to.Author}`,
			`${padRight("Author URI:", maxTagLength)}\t${conf.to.AuthorUri}`,
			`${padRight("Description:", maxTagLength)}\t${conf.to.Description}`,
			`${padRight("Tags:", maxTagLength)}\tgrid-layout, one-column, two-columns, custom-background, custom-colors, custom-header, custom-logo, custom-menu, featured-images, footer-widgets, post-formats, sticky-post, theme-options, threaded-comments, translation-ready, blog`,
			`${padRight("Requires CP:", maxTagLength)}\t2.0`,
			`${padRight("Requires PHP:", maxTagLength)}\t7.4`,
			`${padRight("Version:", maxTagLength)}\t1.0.0`,
			`${padRight("License:", maxTagLength)}\tGNU General Public License v2 or later`,
			`${padRight("License URI:", maxTagLength)}\thttps://www.gnu.org/licenses/gpl-2.0.html`,
			`${padRight("Text Domain:", maxTagLength)}\t${casex(conf.to.Name, 'ca-se').toLowerCase()}`
		]
	};
};

export default async (config, ignoreFile) => {
	const replacePhp = await doReplacePhp(config, ignoreFile);
	await replace(replacePhp);

	console.log("\nAll Files Updated Successfully.");
};
