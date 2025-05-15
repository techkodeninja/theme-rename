import fs from "fs-extra";
import renameTheme from "./src/replace.mjs";

export default async (config, ignoreFile = "**/*.ignore") => {
	try {
		// ✅ Directly read the configuration file
		let newConf = await fs.readJson(config);

		// ✅ Validate if `to` configuration exists
		if (!newConf.to) {
			console.error("Error: No 'to' configuration found in themerename.json");
			process.exit(1);
		}

		console.log("\nStarting Theme Replacement...");
		
		// ✅ Perform the replacement
		await renameTheme(newConf, ignoreFile);

		console.log("\nTheme Renaming Completed Successfully!");
	} catch (error) {
		console.error("Failed to process theme replacement:", error.message);
		process.exit(1);
	}
};
