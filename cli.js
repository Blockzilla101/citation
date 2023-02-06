const { Citation }= require('./index.js')
const args = require('args-parser')(process.argv);

if (typeof args.output !== 'string') {
    console.log('output path is required')
    process.exit(1)
}

if (typeof args.reason !== 'string') {
    console.log('reason is required')
    process.exit(1)
}

if (typeof args.title !== 'string') {
    console.log('title is required')
    process.exit(1)
}

if (typeof args.penalty !== 'string') {
    console.log('penalty is required')
    process.exit(1)
}


const citation = new Citation(args.width, args.height);

citation.resizeReason = args.resize ?? false
citation.resizeLimit = args['resize-limit'] ?? 0
citation.title = args.title
citation.reason = args.reason
citation.penalty = args.penalty

if (args.barcode) {
    citation.barcode = args.barcode.split('')
}

citation.render(args.output, args.gif)
