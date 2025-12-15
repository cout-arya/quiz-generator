const fs = require('fs');
const pdf = require('pdf-parse');

console.log('Testing pdf-parse isolation...');

try {
    // Create a dummy PDF buffer (invalid content but checks load)
    // Actually, pdf-parse might fail on invalid content, but let's see if REQUIRE crashes.
    // The previous error was a module load error.

    console.log('pdf-parse loaded:', typeof pdf);

    const dummyBuffer = Buffer.from('PDF-1.4 ... dummy content');

    pdf(dummyBuffer).then(data => {
        console.log('Parsed (unexpected success on dummy buffer):', data.text);
    }).catch(err => {
        console.log('Parse failed as expected on dummy buffer (but module loaded ok):', err.message);
    });

} catch (e) {
    console.error('CRASH in test script:', e);
}
