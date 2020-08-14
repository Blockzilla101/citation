const { Citation } = require('./citation');

let citation = new Citation('./Citation.png');

function parseHrtimeToSeconds(hrtime) {
    return (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
}

function randomBarcode(size) {
    let barcode = [];
    for (let i = 0; i < size; i++) {
        barcode.push(Math.random() + Math.random() + Math.random() > 1.4 ? 1 : 0);
    }
    return barcode;
}

citation.width = 366;
citation.height = 160;

citation.topBottomDotSize = 2;
citation.sideDotSize = 6
citation.sideDotSpacing = 4;

citation.autoResizeToText = true;
citation.fontSize = 16;

// citation.barcode = randomBarcode(11);
// let anim = process.hrtime();
// citation.animated().then(() => {
//     console.log(`Took ${parseHrtimeToSeconds(process.hrtime(anim))}s to make animated gif`);
// });

let start = process.hrtime();
citation.generate().then(() => {
    console.log(`Took ${parseHrtimeToSeconds(process.hrtime(start))}s to make static citation`);
});
