import fs          from "fs-extra";
import chalk       from "chalk";
import renameTheme from "./src/replace.mjs";

export default async ( config, ignoreFile = "**/*.ignore" ) => {

	try {

		// ✅ Directly read the configuration file
		let newConf = await fs.readJson( config );

		// ✅ Validate if `to` configuration exists
		if ( !newConf.to ) {
			console.error( chalk.red( "\n❌ Error: No 'to' configuration found in themerename.json\n" ) );
			process.exit( 1 );
		}

		// ✅ Validate the required fields inside `to`
		const requiredFields = [ "Name", "Uri", "Description" ];
		for ( const field of requiredFields ) {
			if ( !newConf.to[field] ) {
				console.error( chalk.red( `\n❌ Error: Missing required field '${field}' in 'to' configuration.\n` ) );
				process.exit( 1 );
			}
		}

		// ✅ Log start process
		console.log( chalk.green( "\n🚀 Starting Theme Replacement...\n" ) );

		// ✅ Perform the replacement
		await renameTheme( newConf, ignoreFile );

		// ✅ Log completion
		console.log( chalk.green( "\n🎉 Theme Renaming Completed Successfully!\n" ) );

	} catch ( error ) {

		console.error( chalk.red( "\n❌ Failed to process theme replacement:" ), error.message );
		process.exit( 1 );

	}
};
