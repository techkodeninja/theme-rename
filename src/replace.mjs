import casex from "casex";
import replace from "replace-in-file";
import path from "path";

const themeRoot = process.cwd();

/**
 * Right-aligns the tag to match the longest one (e.g., `@copyright`)
 */
const padRight = (tag, maxLength) => tag.padEnd(maxLength);

/**
 * Maximum length for alignment (`@license` is the longest here)
 */
const maxTagLength = Math.max(
	"@package".length,
	"@author".length,
	"@copyright".length,
	"@license".length,
	"@link".length
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
			`${themeRoot}/public/views/**/*.php`
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
			new RegExp(`©\\s+${conf.from.Author}`, "g")
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
			`© ${conf.to.Year} ${conf.from.Author}`
		]
	};
};

export default async (config, ignoreFile) => {
	const replacePhp = await doReplacePhp(config, ignoreFile);
	await replace(replacePhp);

	console.log("\nAll Files Updated Successfully.");
};
