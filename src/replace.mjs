import casex from "casex";
import replace from "replace-in-file";
import path from "path";

// ✅ Default to 2019 if no year is detected
const currentYear = "2019";
const themeRoot = process.cwd();

const doReplacePhp = async (conf, ignoreFile) => {
	return {
		allowEmptyPaths: true,
		ignore: [
			"vendor/**/*",
			"node_modules/**/*",
			".git/**/*",
			ignoreFile
		],
		files: [`${themeRoot}/**/*.php`],
		from: [
			new RegExp(`namespace ${casex(conf.from.Name, 'CaSe')}`, "g"),
			new RegExp(`${casex(conf.from.Name, 'CaSe')}\\\\`, "g"),
			new RegExp(`(@package\\s+)${casex(conf.from.Name, 'CaSe')}`, "g"),
			new RegExp(`\\$${casex(conf.from.Name.toLowerCase(), 'ca_se')}`, "g"),
			new RegExp(`${casex(conf.from.Name.toLowerCase(), 'ca_se')}/`, "g"),
			new RegExp(`'${casex(conf.from.Name.toLowerCase(), 'ca-se')}'`, "g"),
			new RegExp(conf.from.AuthorEmail, "g"),
			new RegExp(conf.from.Uri, "g"),
			new RegExp(conf.from.AuthorUri, "g"),
			new RegExp(conf.from.Author, "g"),
			new RegExp(`${conf.from.Name} `, "g"),
			// ✅ Copyright Replacement
			new RegExp(`@copyright\\s+[0-9]{4}\\s+${conf.from.Author}`, "g"),
			new RegExp(`©\\s+[0-9]{4}\\s+${conf.from.Author}`, "g")
		],
		to: [
			`namespace ${casex(conf.to.Name, 'CaSe')}`,
			`${casex(conf.to.Name, 'CaSe')}\\`,
			`@package   ${casex(conf.to.Name, 'CaSe')}`,
			`\$${casex(conf.to.Name.toLowerCase(), 'ca_se')}`,
			`${casex(conf.to.Name.toLowerCase(), 'ca_se')}/`,
			`'${casex(conf.to.Name.toLowerCase(), 'ca-se')}'`,
			conf.to.AuthorEmail,
			conf.to.Uri,
			conf.to.AuthorUri,
			conf.to.Author,
			`${conf.to.Name} `,
			// ✅ Copyright Replacement - If year not found, defaults to 2019
			`@copyright ${currentYear} ${conf.to.Author}`,
			`© ${currentYear} ${conf.to.Author}`
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
			ignoreFile
		],
		files: [`${themeRoot}/**/*.js`, `${themeRoot}/**/*.scss`],
		from: [
			new RegExp(conf.from.AuthorEmail, "g"),
			new RegExp(conf.from.Author, "g"),
			new RegExp(conf.from.Uri, "g"),
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

	console.log("\nFiles Updated Successfully.");
};
