import casex from "casex";
import replace from "replace-in-file";
import path from "path";

// ✅ Use the "Year" field from the configuration
const themeRoot = process.cwd();

const doReplacePhp = async (conf, ignoreFile) => {
	return {
		allowEmptyPaths: true,
		ignore: [
			"vendor/**/*",
			"node_modules/**/*",
			".git/**/*",
			"public/views/**/*",    // ✅ Ignoring public/views directory
			ignoreFile
		],
		files: [`${themeRoot}/**/*.php`],
		from: [
			// ✅ Namespace Replacement
			new RegExp(`namespace ${casex(conf.from.Name, 'CaSe')}`, "g"),
			// ✅ Package Replacement
			new RegExp(`(@package\\s+)${casex(conf.from.Name, 'CaSe')}`, "g"),
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
			// ✅ Copyright Replacement
			new RegExp(`@copyright\\s+([0-9]{4})\\s+${conf.from.Author}`, "g"),
			new RegExp(`©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g")
		],
		to: [
			// ✅ Namespace Replacement
			`namespace ${casex(conf.to.Name, 'CaSe')}`,
			// ✅ Package Replacement
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
			`© ${conf.to.Year} ${conf.from.Author}`
		]
	};
};

const doReplaceAssets = async (conf, ignoreFile) => {
	return {
		allowEmptyPaths: true,
		ignore: [
			"vendor/**/*",
			"node_modules/**/*",
			".git/**/*",
			"public/views/**/*",    // ✅ Ignoring public/views directory
			ignoreFile
		],
		files: [`${themeRoot}/**/*.js`, `${themeRoot}/**/*.scss`],
		from: [
			// ✅ Author Information
			new RegExp(conf.from.AuthorEmail, "g"),
			new RegExp(conf.from.Author, "g"),
			new RegExp(conf.from.Uri, "g"),
			// ✅ Name Replacement
			new RegExp(casex(conf.from.Name, 'CaSe'), "g"),
			new RegExp(`'${casex(conf.from.Name, 'ca-se')}'`, "g")
		],
		to: [
			conf.to.AuthorEmail,
			conf.to.Author,
			conf.to.Uri,
			casex(conf.to.Name, 'CaSe'),
			`'${casex(conf.to.Name.toLowerCase(), 'ca-se')}'`
		]
	};
};

export default async (config, ignoreFile) => {
	const replacePhp = await doReplacePhp(config, ignoreFile);
	await replace(replacePhp);

	const replaceAssets = await doReplaceAssets(config, ignoreFile);
	await replace(replaceAssets);

	console.log("\nAll Files Updated Successfully.");
};
