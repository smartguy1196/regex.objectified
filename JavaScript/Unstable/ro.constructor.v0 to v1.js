	//The primer token is initialized here
	//The primer token is pretty much the main token (which is pretty much the RegExSearch Object minus the Search methods)

	this.tokens = [

		{

			"regex" : RegExArg,
			"type" : "string::unidentified"

		}

	]

	//Initialize the debug object, this contains all varialbes relevant to the constructor, but not to the tokens (outside of the native regex ones listed above in the beginnning of the script)

		//DRAFT 3: According to Draft 3 and above of regex.objectified, the Debug Object is to contain 3 properties, string tracker, cycler sync, and detector sync

	var debug = {

		"string_tracker" : [], //Used for tracking unidentified string tokens
		"cycler_sync" : { //Used for storing data over different Cycler Loops

				//DRAFT 3: According to Draft 3 and above of regex.objectified, the cycler_sync object is to contain 3 properties, detector number, group depth, and a boolean identifying if a block (group) is unfinished

			"detector" : 0 //Used for identifying what detector to use
			"group_depth" : 0, //Used for tracking how deep a detected group is
			"is_unfinished_block" : false, //Used for keeping track of the fact that atleat one group is unfinished

		},
		"detector_sync" : { //Used for storing data over different Detector Loops

			"prev_string_tracker_value": -1 //Used to help detect whether the current value existing at the currently-being checked string tracker index has changed, if it did not, detector will stop looping, so that the next token can be cycled through

		},
		"incremental_sync" : {

			"string_tracker_id_num" : 0, //Incremental value also referred to as the current string tracker index that is used to help access the current string tracker value
			"native_regex_part_index" : 0, //Incremental value used to assemple native regex parts into a complete native regex object
			"string_tracker_id_num_not_current" : 0 //Incremental value used to help apply changes to string tracker values that ar not the current string tracker value

		}

	}

	//track the primer token

	debug.string_tracker[] = 0 //0 is the index of the primer token

		/**************************************************************************************************************************************************

		DRAFT 3 (PART III):

		- Token Cycler

		**************************************************************************************************************************************************/

	for( //Token Cycler (loops through unidentified string tokens: tokens that could possibly have undiscovered (identifiable) tokens within them)

		//reinitialize the string tracker index to 0

		debug.incremental_sync.string_tracker_id_num = 0;

		//if the amount of checked strings plus 1 (amount is based off of the current string tracker index - already checked values are everything, but the value found at the current string tracker index, because that value has not yet been checked) (if the currently checking index) is less than the total amount of tracked strings, loop through checks

		debug.incremental_sync.string_tracker_id_num < debug.string_tracker.length;

		//after every loop increment the checking index by 1

		debug.incremental_sync.string_tracker_id_num++;

	){

	    //reinitialize detector_sync

	    debug.detector_sync = {

	    	"prev_string_tracker_value": -1
    	
	    }

		/**************************************************************************************************************************************************

		DRAFT 3 (PART IV):

		- Token Detectors: Escape (Non-Groupable: Sequential)

		**************************************************************************************************************************************************/

		while( //Escape Detector

			//Matcher Clause

			(
				native_match = ( 
					new RegExp( "/\\\\/" )
				).exec(
					this.tokens[

						debug.string_tracker[

							debug.incremental_sync.string_tracker_id_num

						]

					].regex
				)
			) != null &&

			//Switcher Clause

			(
				debug.cycler_sync.detector = (
					debug.cycler_sync.detector === 0

					? (
						debug.detector_sync.prev_string_tracker_value 
						
						<
						
						debug.string_tracker[

							debug.incremental_sync.string_tracker_id_num

						]

						? 0 : 1
					) : debug.cycler_sync.detector
				)
			) === 0
		){

			//if match the match is NOT at the beginning (match.index !== 0) of the string, make the first token be all the junk before the "\", and create a new token that will be a Mixed Token (Escape/Unidentified)

			if( native_match.index !== 0 ) //Preceding Unidentified String Detector
			{

				//First, create the Mixed Token (handle match, so that we can discard the original this.tokens[#].regex)

				//Set the Mixed Token's regex

				this.tokens[

					1 + debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].regex = this.tokens[

					debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].regex.substring( native_match.index )

				//Set the Mixed Token's type to be a mixed string (string::mixed)

        		this.tokens[

					1 + debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].type = "string::mixed";

				//Secondly, create the Unidentified String that exists before the escape character ("\"), as it has already been processed (it is already being tracked)

				//Set the Preceding Unidentified Token's regex

				this.tokens[

					debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].regex = this.tokens[

					debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].regex.substring( 0, native_match.index );

				//Set the Preceding Unidentified Token's type to be an unidentified string (string::unidentified)

        		this.tokens[

					debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].type = "string::unidentified";

				//Since we inserted a new unidentified string for the Preceding Unidentified String, but created a new token for the Mixed Token,
				//we will just keep the string tracker value at the current string tracker ID the same, and add a new tracker

					//DRAFT 3: According to Draft 3 of Regex.Objectified, Sequential Detectors (Escape Detectors) do not require and therefore will not have Tracker Incrementsrs, just Additions

				//Tracker Addition:

				debug.string_tracker[

					1 + debug.incremental_sync.string_tracker_id_num

				] = 1 + debug.string_tracker[

					debug.incremental_sync.string_tracker_id_num

				]
				debug.incremental_sync.string_tracker_id_num++;

			} //Preceding Unidentified String Detector
			else
			{ //There was no Preceding Unidentified String

				//Since there was no Preceding Unidentified String, that means that the Mixed token starts at the beginning,
				//or otherwise meaning that the token at the string tracker value is not an Unidentified String Token, but a Mixed Token,
				//so we only change its type from Unidentified to Mixed

				//assign the currently existing token, which DOES NOT require change in the regex property, to the Mixed Token type

				this.tokens[

					debug.string_tracker[

						debug.incremental_sync.string_tracker_id_num

					]

				].type = "string::mixed";

			} //Preceding Unidentified String Detector (FAILED)

			//This is where the Sequential Detection begins

			//We start by determining if there is even a sequence after the "\"
			//(The following section is for detecting whether the following characters (after the "\" taken from the match) form a string with a length greater than 0 (the following string is not an empty string))

			if( this.tokens[										//a (any) sequence exists?

				debug.string_tracker[

					debug.incremental_sync.string_tracker_id_num

				]

			].regex.substring( 1 ).length > 0 )						//a (any) sequence exists?
			{

				//Next we detect for these defined sequences:

				native_regexp_parts =  [ //escape sequences
					"^(\\d\\d\\d?)", //Octal
					"^(x[A-Fa-f0-9]{2})", //Hexadecimal
					"^(u[A-Fa-f0-9]{4})", //Unicode
					"^(c[A-Za-z])", //Control Character
					"^([1-9])" //Back Reference
				]

				for( //Synthesize native_regexp from the native_regexp_parts array

					//Reinitialize the regex_string (acually escape) index

					debug.incremental_sync.native_regex_part_index = 0;

					//if the escape index is less than the amount of escapes, execute the loop

					debug.incremental_sync.native_regex_part_index < native_regexp_parts.length;

					//increment the index after each loop

					debug.incremental_sync.native_regex_part_index++;

				){ //Synthesize native_regexp from the native_regexp_parts array

					native_regexp += ( //add to the native_regexp string the following:

						debug.incremental_sync.native_regex_part_index === 0 ? "/" : "|" //if this is the first loop, start the string with the regex starting character "/", otherwise add the regex or character "|"

					) + native_regexp_parts[ //then add the current/corresponding native regexp part to the native_regexp string

						debug.incremental_sync.native_regex_part_index

					]; //then add the current/corresponding native regexp part to the native_regexp string (cont./end.)

				} //Synthesize native_regexp from the native_regexp_parts array

		        //at this point native_regexp has all necessary characters/parts except for the terminator (and any flags, but we don't need flags)

		        native_regexp += "/";

		        //Next we detect for the aboce defined sequences /\

        		//NOTE: detection starts at index '1', because the following sequence detection does not have to incude the first character "\", so it is therefore excluded from the following search:

        		if( 
        			( native_match = ( new RegExp( native_regexp ) ).exec( this.tokens[

						debug.string_tracker[

							debug.incremental_sync.string_tracker_id_num

						]

					].regex.substring( 1 ) ) ) != null 
				){

        			//is the SPECIAL ESCAPE sequence an OCTAL ESCAPE?

        			if( native_match[ 1 ].length != 0 )
        			{

        				//This is where we handle the Trailing Unidentified String, this process incorporates the Preventive Check Design from previous drafts

        				if( //Preventive Check (There is a Trailing Unidentified String) (Tracker Moving)
        					this.tokens[

								debug.string_tracker[

									debug.incremental_sync.string_tracker_id_num

								]

							].regex.substring( match[ 1 ].length /*-1 (to get final index) +1 (to make final index non-inclusive)*/ +1 /*include the length of the "\"*/ ).length > 0
						){ //Preventive Check (There is a Trailing Unidentified String)

        					

        				} //Preventive Check (There is a Trailing Unidentified String)
        				else
						{ //Preventive Check (There is NO Trailing Unidentified String) (Tracker Deletion)



						} //Preventive Check (There is NO Trailing Unidentified String)

        			}

				}

			}

		}

		/**************************************************************************************************************************************************

		DRAFT 3 (PART IV):

		- Token Detectors: Class (Groupable:No-Nesting)

		**************************************************************************************************************************************************/

		/**************************************************************************************************************************************************

		DRAFT 3 (PART IV):

		- Token Detectors: Shorthand (Non-Groupable:Shorthand)

		**************************************************************************************************************************************************/

		/**************************************************************************************************************************************************

		DRAFT 3 (PART IV):

		- Token Detectors: Groups (Groupable:Nesting)

		**************************************************************************************************************************************************/

		/**************************************************************************************************************************************************

		DRAFT 3 (PART IV):

		- Token Detectors: Quantifiers/Attributes (Groupable:No-Nesting)

		**************************************************************************************************************************************************/

}