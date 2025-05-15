import casex from "casex";
import replace from "replace-in-file";
import path from "path";

const themeRoot = process.cwd();

/**
 * Aligns header fields with tab spacing.
 */
const padHeader = (field) => {
	const maxLength = 14; // Maximum length for headers (e.g., "Requires PHP")
	return field.padEnd(maxLength, ' ');
};

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
			`@package ${casex(conf.to.Name, 'CaSe')}`,
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
			`@copyright ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			`© ${conf.to.Year} ${conf.from.Author}`,
			// ✅ WordPress style.css replacements with alignment
			`${padHeader("Theme Name:")}\t${casex(conf.to.Name, 'CaSe')}`,
			`${padHeader("Theme URI:")}\t${conf.to.Uri}`,
			`${padHeader("Author:")}\t${conf.to.Author}`,
			`${padHeader("Author URI:")}\t${conf.to.AuthorUri}`,
			`${padHeader("Description:")}\t${conf.to.Description}`,
			`${padHeader("Tags:")}\tgrid-layout, one-column, two-columns, custom-background, custom-colors, custom-header, custom-logo, custom-menu, featured-images, footer-widgets, post-formats, sticky-post, theme-options, threaded-comments, translation-ready, blog`,
			`${padHeader("Requires CP:")}\t2.0`,
			`${padHeader("Requires PHP:")}\t7.4`,
			`${padHeader("Version:")}\t1.0.0`,
			`${padHeader("License:")}\tGNU General Public License v2 or later`,
			`${padHeader("License URI:")}\thttps://www.gnu.org/licenses/gpl-2.0.html`,
			`${padHeader("Text Domain:")}\t${casex(conf.to.Name, 'ca-se').toLowerCase()}`
		]
	};
};

export default async (config, ignoreFile) => {
	const replacePhp = await doReplacePhp(config, ignoreFile);
	await replace(replacePhp);

	console.log("\nAll Files Updated Successfully.");
};
