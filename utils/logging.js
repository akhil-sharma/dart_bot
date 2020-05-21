/*
*
*   Logging handler for the Bot
*
*   Selective logging degending on the command module
*
*/

var levels = {
    trace : 0,
    debug : 1,
    info  : 2,
    warn  : 3,
    error : 4
};

var debuggingPermissions = {

    loggingEnabled      : true,
    defaultLoggingLevel : levels.trace,
    
    music : {

        loggingEnabled              : true,
        defaultLoggingLevel         : levels.trace,

        play     : true,
        pause    : true,
        skip     : true,
        playlist : true,
        resume   : true,
        volume   : true,
        stop     : true,
        loop     : true
    },

    fun : {

        loggingEnabled              : true,
        defaultLoggingLevel         : levels.trace,

        joke : true
    },

    weather : {

        loggingEnabled              : true,
        defaultLoggingLevel         : levels.trace,

        weather : true
    },

    currency : {

        loggingEnabled              : true,
        defaultLoggingLevel         : levels.trace,

        currency : true
    }
};

// A variadic function to log the stuff
function log(loggingLevel, loggingParameters){
    var handlingInfo = loggingParameters[0];
    var commandModule    = handlingInfo.commandModule;
    var commandHandler   = handlingInfo.commandHandler;

    var defaultLoggingLevel = debuggingPermissions[commandModule].defaultLoggingLevel;

    // We need to log all the errors
    if (loggingLevel !== levels.error && (!isLoggingEnabled(commandModule, commandHandler) || loggingLevel > defaultLoggingLevel)) {
        return;
    }

    var stream = process.stdout;
    if(loggingLevel === levels.error){
        stream = process.stderr;
    }

    for(var i = 1; i < loggingParameters.length; i++){
        stream.write(commandModule + ' ::: ' + commandHandler + ' ::: ' + JSON.stringify(loggingParameters[i]) + '\n');
    }
}


function trace(/* arguments */){
    log(levels.trace, arguments);
}

function debug(/* arguments */){
    log(levels.debug, arguments);
}

function info(/* arguments */){
    log(levels.info, arguments);
}

function warn(/* arguments */){
    log(levels.warn, arguments);
}

function error(/* arguments */){
    log(levels.error, arguments);
}

function isLoggingEnabled(module, handler){
    // Check if the logging has been enabled
    if(!debuggingPermissions.loggingEnabled){
        return false;
    }

    // Check if the logging has been enabled for the complete module
    if (!debuggingPermissions[module].loggingEnabled){
        return false;
    }

    // Check if the logging has been enabled for the particular handler function for the module
    if (!debuggingPermissions[module][handler]){
        return false;
    }

    return true;
}

exports.trace               = trace;
exports.debug               = debug;
exports.info                = info;
exports.warn                = warn;
exports.error               = error;