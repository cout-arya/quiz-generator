const fs = require('fs');
const pdf = require('pdf-extraction');

console.log('Testing pdf-extraction...');

try {
    const dummyBuffer = Buffer.from('PDF-1.4 ... dummy content');
    // pdf-extraction likely expects a buffer or file path
    pdf(dummyBuffer).then(data => {
        console.log('Parsed text:', data.text);
    }).catch(e => {
        // Expected error on dummy content, but check if module loaded
        console.log('Module loaded, parsing failed as expected:', e.message);
    });
} catch (e) {
    console.error('CRASH:', e);
}
