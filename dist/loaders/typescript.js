export function checkIfTypescriptSupported() {
    if (!process.features.typescript) {
        const error = new Error('To load typescript files with env-cmd, you need to upgrade to node v23.6' +
            ' or later. See https://nodejs.org/en/learn/typescript/run-natively');
        Object.assign(error, { code: 'ERR_UNKNOWN_FILE_EXTENSION' });
        throw error;
    }
}
