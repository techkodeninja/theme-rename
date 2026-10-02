import { readFile } from "node:fs/promises";

/**
 * Fields that may appear in `from` / `to`. Only `Name` is required; every other
 * field is replaced only when it is present in both blocks.
 */
export const FIELDS = [
	"Name",
	"Description",
	"Namespace",
	"TextDomain",
	"Uri",
	"Author",
	"AuthorEmail",
	"AuthorUri",
	"Year"
];

/**
 * Validates a parsed themerename.json object. Throws on the first problem.
 */
export const validateConfig = ( conf ) => {
	if ( !conf || typeof conf !== "object" ) {
		throw new Error( "themerename.json must contain a JSON object." );
	}

	for ( const block of [ "from", "to" ] ) {
		if ( !conf[ block ] || typeof conf[ block ] !== "object" ) {
			throw new Error( `No '${block}' block found in themerename.json.` );
		}
		if ( typeof conf[ block ].Name !== "string" || !conf[ block ].Name.trim() ) {
			throw new Error( `Missing required field '${block}.Name'.` );
		}
	}

	for ( const field of FIELDS ) {
		const from = conf.from[ field ];
		const to   = conf.to[ field ];

		for ( const [ block, value ] of [ [ "from", from ], [ "to", to ] ] ) {
			if ( value !== undefined && ( typeof value !== "string" || !value.trim() ) ) {
				throw new Error( `'${block}.${field}' must be a non-empty string.` );
			}
		}

		// A `from` value with nothing to replace it with would silently do nothing,
		// which is almost always a typo in the config.
		if ( from !== undefined && to === undefined ) {
			throw new Error( `'from.${field}' is set but 'to.${field}' is missing.` );
		}
	}

	if ( conf.ignore !== undefined && !Array.isArray( conf.ignore ) ) {
		throw new Error( "'ignore' must be an array of paths." );
	}

	return conf;
};

/**
 * Reads and validates a themerename.json file.
 */
export const loadConfig = async ( file ) => {
	let raw;
	try {
		raw = await readFile( file, "utf8" );
	} catch ( error ) {
		if ( error.code === "ENOENT" ) {
			throw new Error( `Config file not found: ${file}` );
		}
		throw error;
	}

	let conf;
	try {
		conf = JSON.parse( raw );
	} catch ( error ) {
		throw new Error( `Could not parse ${file}: ${error.message}` );
	}

	return validateConfig( conf );
};
