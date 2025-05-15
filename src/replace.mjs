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
			// ✅ Match any year with the author's name
			new RegExp(`@copyright\\s+([0-9]{4})\\s+${conf.from.Author}`, "g"),
			new RegExp(`©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g")
		],
		to: [
			// ✅ Replace only the year with the new one from JSON
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
			new RegExp(`©\\s+([0-9]{4})\\s+${conf.from.Author}`, "g")
		],
		to: [
			`© ${conf.to.Year} ${conf.from.Author}`
		]
	};
};

export default async (config, ignoreFile) => {
	const replacePhp = await doReplacePhp(config, ignoreFile);
	await replace(replacePhp);

	const replaceAssets = await doReplaceAssets(config, ignoreFile);
	await replace(replaceAssets);

	console.log("\nCreation Year Updated Successfully.");
};
