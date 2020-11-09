var localStorage = require('localStorage');

// 60 	= 	1 min 	//	300 	= 	5 min
// 420 	= 	7 min 	//	600 	= 	10 min
setStorage = ( key, value = '', expires = 600 ) => {

  if ( expires === undefined || expires === null )
  { // Por defecto: segundos por 1 día
  	expires = (24 * 60 * 60);
  }
  else
  {        
  	expires = Math.abs(expires);
  }

  let now      = Date.now();
  let schedule = now + expires * 1000;

  try
  {
    localStorage.setItem(key, schedule);
  }
  catch (e)
  {
    console.log( 'setStorage: Error setting key [' + key + '] in localStorage: ' + JSON.stringify(e) );
    return false;
  }

  return true;
};

getStorage = key => {

  let now       = Date.now();
  let expiresIn = localStorage.getItem(key);

  if (expiresIn === undefined || expiresIn === null)
  {
    expiresIn = '0';
  }

  if ( parseInt(expiresIn) < now ) // Si esta caducado eliminamos
  {
    removeStorage(key);
    return null;
  }
  else
  {
    try
    {
      return localStorage.getItem(key);
    }
    catch ( e )
    {
      console.log( 'getStorage: Error reading key [' + key + '] from localStorage: ' + JSON.stringify( e ) );
      return null;
    }
  }
};

removeStorage = key => {
  try
  {
    localStorage.removeItem( key );
  }
  catch ( e )
  {
    console.log( 'removeStorage: Error removing key [' + key + '] from localStorage: ' + JSON.stringify( e ) );
    return false;
  }

  return true;
};

// setStorage( 'clave', 'valor', 60 ); // 1 Minuto
// getStorage( 'clave' );
// removeStorage( 'clave' );

exports.setStorage = setStorage;
exports.getStorage = getStorage;
exports.removeStorage = removeStorage;