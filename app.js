var uploadButton = document.getElementById( 'upload-button' ),
	upload = document.getElementById( 'upload' ),
	form = document.getElementById( 'form' ),
	uploadBackdrop = document.getElementById( 'upload-backdrop' ),
	progress = document.getElementById( 'progress' ),
	result = document.getElementById( 'result' ),
	resultHash = document.getElementById( 'result-hash' ),
	resultURL = document.getElementById( 'result-url' ),
	progressInterval;

/**
 * Returns true if a given file path or file path fragment represents a hidden
 * file, or false otherwise.
 *
 * @param {string} name File path to test.
 *
 * @return {boolean} Whether file path is for hidden file.
 */
function isHiddenFile( name ) {
	return /^\./.test( name );
}

/**
 * Returns true if the given response object represents the root directory
 * entry, or false otherwise.
 *
 * @param {Object} data Response object.
 *
 * @return {boolean} Whether object represents the root directory.
 */
function isDirectoryObject( object ) {
	return !! object.Hash && object.Name.split( '/' ).length === 1;
}

/**
 * Modifies the given FormData instance to remove hidden files and folders.
 *
 * @param {FormData} data FormData instance.
 * @param {string}   name FormData field to filter.
 */
function removeHiddenFiles( data, name ) {
	var files = data.getAll( name );
	data.delete( name );
	files
		.filter( function( file ) {
			return ! isHiddenFile( file.name ) && (
				! file.webkitRelativePath ||
				! file.webkitRelativePath.split( '/' ).some( isHiddenFile )
			);
		} )
		.forEach( function( file ) {
			data.append( name, file );
		} );
}

/**
 * Updates the UI when upload begins or ends.
 *
 * @param {boolean} isInProgress Whether upload is in progress.
 */
function toggleUploadInProgress( isInProgress ) {
	result.classList.toggle( 'is-hidden', isInProgress );
	progress.value = isInProgress ? 0 : 100;

	clearInterval( progressInterval );
	if ( isInProgress ) {
		progressInterval = setInterval( function() {
			progress.value = Math.min( Number( progress.value ) + .05, 95 );
		}, 16 );
	}

	// The progress bar is an ARIA live region by which progress updates can be
	// announced.
	progress.textContent = isInProgress
		? 'Upload in progress'
		: 'Upload complete';
}

/**
 * Returns the object data for the directory entry from response text, if
 * exists.
 *
 * @param {string} responseText Response text.
 *
 * @return {Object|undefined} Response object, if exists.
 */
function getDirectoryObject( responseText, name ) {
	var data, lines, line;
	lines = responseText.split( '\n' );

	while ( ( line = lines.shift() ) ) {
		try {
			data = JSON.parse( line );
		} catch ( error ) {}

		if ( data && isDirectoryObject( data ) ) {
			return data;
		}
	}
}

/**
 * Activates the `role="button"` element in response to a key event for Enter
 * or Space keys, necessary to retain expected accessible keyboard operation
 * of a button. Assumes that the event target is of nodeName LABEL, associated
 * with form input to be activated by click.
 *
 * @param {KeyboardEvent} event Key event.
 */
function proxyUploadKeyActivation( event ) {
	if (
		event.keyCode === /* Enter */ 13 ||
		event.keyCode === /* Space */ 32
	) {
		event.currentTarget.click();
	}
}
uploadButton.addEventListener( 'keydown', proxyUploadKeyActivation );

/**
 * Submits the closest form by manually-dispatched event, if the input target of
 * the change event has a non-empty value.
 *
 * @param {Event} event Input event.
 */
function submitClosestForm( event ) {
	if ( event.currentTarget.value ) {
		event.currentTarget.dispatchEvent( new Event( 'submit', {
			bubbles: true,
			cancelable: true,
		} ) );
	}
}
upload.addEventListener( 'input', submitClosestForm );

/**
 * Updates the UI in response to a drag event, toggling an `is-over` class on
 * the target of the drag event.
 *
 * @param {Event} event Dispatched drag event.
 */
function toggleIsDraggingOver( event ) {
	var isOver = event.type === 'dragenter' || event.type === 'dragover';
	event.currentTarget.classList.toggle( 'is-over', isOver )
}
[ 'dragenter', 'dragover', 'dragleave', 'drop' ].forEach( function( eventName ) {
	form.addEventListener( eventName, toggleIsDraggingOver );
} );

/**
 * Uploads files in response to a form submission.
 *
 * @param {Event} event Submit event.
 */
function uploadFiles( event ) {
	var data = new FormData( event.currentTarget ),
		xhr = new XMLHttpRequest;

	removeHiddenFiles( data, 'file' );
	toggleUploadInProgress( true );

	xhr.open( event.currentTarget.method, event.currentTarget.action );
	xhr.onreadystatechange = function() {
		var data, url;
		if ( xhr.readyState !== 4 ) {
			return;
		}

		toggleUploadInProgress( false );

		if ( xhr.status === 200 ) {
			data = getDirectoryObject( xhr.responseText );
		}

		if ( data ) {
			url = 'https://ipfs.io/ipfs/' + data.Hash;
			resultHash.textContent = data.Hash;
			resultURL.href = url;
			resultURL.textContent = url;
		} else {
			resultHash.textContent = 'An unexpected error occurred.';
		}
	};

	xhr.onprogress = function( updateEvent ) {
		if ( updateEvent.lengthComputable ) {
			clearInterval( progressInterval );
			progress.value = ( updateEvent.loaded / updateEvent.total ) * 100;
		}
	};

	xhr.send( data );
}
form.addEventListener( 'submit', uploadFiles, true );
