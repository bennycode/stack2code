var bunyan = require('bunyan');
var log = bunyan.createLogger({level: 'debug'});

log.trace('this one does not emit');
log.debug('hi on debug');
log.info('hi on info');
log.warn('hi on warn');
log.error('hi on error');