import {shouldLogToConsole} from '~/config';

export function logInfo(message) {
    if (shouldLogToConsole) {
        console.log(message);
    }
}