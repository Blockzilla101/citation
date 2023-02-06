const { Citation }= require('./index.js')
const args = require('args-parser')(process.argv);

if (args.output == null) {
    console.log('output path is required')
    process.exit(1)
}

const citation = new Citation(args.width, args.height);
citation.resizeReason = true
citation.resizeLimit = 100000
citation.reason = 'blah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\nblah\n'
citation.render(args.output, true)
