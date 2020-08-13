const { createCanvas, Canvas, registerFont, NodeCanvasRenderingContext2D, loadImage, Image } = require('canvas');
const { text, textWrapped, line, dottedLine, barcode, rect } = require('./util');

const fs = require('fs');

function loadAssets() {
    const font = 'BMmini.ttf', altFont = 'megan_serif.ttf';
    const logoFile = 'logo.png'
    const dataDir = './data';

    if (!fs.existsSync(`${dataDir}`)) throw Error(`No "${dataDir}" folder found in the current working directory`);
    if (!fs.existsSync(`${dataDir}/${font}`)) throw Error(`Font '${font}' is no where to be found`);
    if (!fs.existsSync(`${dataDir}/${altFont}`)) throw Error(`Font '${altFont}' is no where to be found`);
    if (!fs.existsSync(`${dataDir}/${logoFile}`)) throw Error(`Logo '${logoFile}' is no where to be found`);

    registerFont(`${dataDir}/${font}`, { family: 'BMmini' });
    registerFont(`${dataDir}/${altFont}`, { family: 'Megan' });
}
loadAssets();

/** @class Citation */
module.exports.Citation = class Citation {
    /** @type {string} Background color of the citation */
    moaBg = '#F3D7E6';
    /** @type {string} Foreground color of the citation */
    moaFg = '#BFA8A8';
    /** @type {string} The font and separator color of the citation */
    moaFt = '#5A5559';

    /** @type {number} Width of the citation*/
    #width = 366;
    /** @type {number} Height of the citation */
    #height = 160;

    /** @type {boolean} Should it resize automatically when text is overflowing*/
    #autoResizeToText = false;

    /** @type {Image} The logo put at the bottom-mid the citation*/
    #logo = null

    /** @type {RenderingContext} */
    #ctx = null;
    /** @type {Canvas} */
    #canvas = null;

    /** @type {string} Where to put the output*/
    #outputFile = './Citation.png';

    /** @type {string} Title of the citation*/
    title = "M.O.A. CITATION";
    /** @type {string} Content/Reason for the citation*/
    content = 'Protocol Violated.\nEntry Permit: Invalid Name';
    /** @type {string} Penalties of the citation*/
    penalty = 'LAST WARNING - NO PENALTY';

    /** @type {number[]} The barcode at the top left*/
    #barcode = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1];

    /** @type {number} Dot size for the dashed line at the top and bottom */
    #topBottomDotSize = 2;
    /** @type {number} Dot size for the dots at the sides of the citation */
    #sideDotSize = 6;
    /** @type {number} Spacing between the dots at the sides of the citation */
    #sideDotSpacing = 4;
    /** @type {number} Separator dot size */
    #separatorDotSize = 2;
    /** @type {number} */
    #barcodeWidth = 2;
    /** @type {number} */
    #barcodeHeight = 12;
    /** @type {number} */
    #fontSize = 16;
    /** @type {string} */
    #font = `${this.#fontSize}px BMmini`;
    /** @type {number} */

    /** @param {string} outputFile */
    constructor(outputFile) {
        this.#outputFile = outputFile;

        this.#canvas = createCanvas(this.#width, this.#height);
        this.#ctx = this.#canvas.getContext('2d');

        this.#ctx.imageSmoothingEnabled = false;
        this.#ctx.antialias = 'none';
    }

    async draw() {
        let sideDotsSpacingFromLeft = this.#sideDotSpacing;
        let sideDotsSpacingFromTop = this.#sideDotSpacing + this.#topBottomDotSize;
        let sideDotsSpacingFromRight = this.#sideDotSpacing + (this.#topBottomDotSize) + 2;

        let separatorSpacingFromLeft = sideDotsSpacingFromLeft + this.#sideDotSize + 6;
        let separatorSpacingFromRight = sideDotsSpacingFromRight + this.#sideDotSize + 6;

        let topSeparatorSpacingFromTop = this.#topBottomDotSize + (this.#fontSize * 2);
        let bottomSeparatorSpacingFromBottom = this.#topBottomDotSize + (this.#fontSize * 2) + 10;

        let barcodeSpacingFromRight = sideDotsSpacingFromRight + this.#sideDotSize + 8;
        let barcodeSpacingFromTop = this.#topBottomDotSize + 4;

        let textSpacingFromLeft = this.#sideDotSpacing + this.#sideDotSize + 12;

        let titleSpacingFromTop = this.#topBottomDotSize + this.#fontSize + 2;
        let titleMaxWidth = this.width - (barcodeSpacingFromRight + (this.#barcode.length * this.#barcodeWidth) + (this.#barcodeWidth * 3) + textSpacingFromLeft + this.#fontSize);

        let reasonSpacingFromTop = topSeparatorSpacingFromTop + this.#separatorDotSize + this.#fontSize + 4;
        let reasonMaxWidth = this.width - (textSpacingFromLeft + sideDotsSpacingFromRight + this.#sideDotSize);

        let penaltySpacingFromBottom = bottomSeparatorSpacingFromBottom - this.#fontSize - 10;

        // Bg
        rect(0, 0, this.width, this.height, this.moaBg, this.#ctx);

        // Logo
        this.#logo = await loadImage('./data/logo.png');
        this.#ctx.drawImage(this.#logo, (this.#width / 2) - (this.#logo.height / 2) - 1, this.height - (bottomSeparatorSpacingFromBottom + (this.#logo.height / 2)) + 4);

        // Top and bottom dots
        dottedLine(0, this.#topBottomDotSize / 2, this.#width, this.#topBottomDotSize / 2, this.moaFg, [this.#topBottomDotSize, this.#topBottomDotSize], this.#ctx, this.#topBottomDotSize);
        dottedLine(this.#topBottomDotSize, this.#height - this.#topBottomDotSize / 2, this.#width, this.#height - this.#topBottomDotSize / 2, this.moaFg, [this.#topBottomDotSize, this.#topBottomDotSize], this.#ctx, this.#topBottomDotSize);

        // Dots on the sides
        dottedLine(sideDotsSpacingFromLeft + (this.#sideDotSize / 2), sideDotsSpacingFromTop, sideDotsSpacingFromLeft + (this.#sideDotSize / 2), this.#height - this.#topBottomDotSize, this.moaFg, [this.#sideDotSize, this.#sideDotSize * 2], this.#ctx, this.#sideDotSize);
        dottedLine(this.#width - sideDotsSpacingFromRight - (this.#sideDotSize / 2), sideDotsSpacingFromTop, this.#width - sideDotsSpacingFromRight - (this.#sideDotSize / 2), this.#height - this.#topBottomDotSize, this.moaFg, [this.#sideDotSize, this.#sideDotSize * 2], this.#ctx, this.#sideDotSize);

        // Separators
        dottedLine(separatorSpacingFromLeft, topSeparatorSpacingFromTop + (this.#separatorDotSize / 2), this.#width - separatorSpacingFromRight, topSeparatorSpacingFromTop + (this.#separatorDotSize / 2), this.moaFt, [this.#separatorDotSize, this.#separatorDotSize], this.#ctx, this.#separatorDotSize);
        dottedLine(separatorSpacingFromLeft, this.height - (bottomSeparatorSpacingFromBottom + (this.#separatorDotSize / 2)), this.#width - separatorSpacingFromRight, this.height - (bottomSeparatorSpacingFromBottom + (this.#separatorDotSize / 2)), this.moaFt, [this.#separatorDotSize, this.#separatorDotSize], this.#ctx, this.#separatorDotSize);

        // Line at the side
        line(this.#width - (this.#topBottomDotSize / 2), 0, this.#width - (this.#topBottomDotSize / 2), this.#height, this.moaFg, this.#ctx, this.#topBottomDotSize);

        // Barcode
        barcode(this.#width - barcodeSpacingFromRight - (this.#barcode.length * this.#barcodeWidth), barcodeSpacingFromTop, this.#barcode, this.#barcodeHeight, this.#barcodeWidth, this.moaFt, this.moaBg, this.#ctx);
        rect(this.#width - barcodeSpacingFromRight - (this.#barcode.length * this.#barcodeWidth) - (this.#barcodeWidth * 3), barcodeSpacingFromTop, this.#barcodeWidth * 2, this.#barcodeHeight / 2, this.moaFt, this.#ctx);

        // Title
        text(this.title, textSpacingFromLeft, titleSpacingFromTop, this.#font, this.moaFt, this.#ctx, 'left', titleMaxWidth);

        // Reason
        textWrapped(this.content, textSpacingFromLeft, reasonSpacingFromTop, this.#font, this.moaFt, this.#ctx, reasonMaxWidth)

        // Penalty
        text(this.penalty, (this.#width / 2) - 3, this.#height - penaltySpacingFromBottom, this.#font, this.moaFt, this.#ctx, 'center', reasonMaxWidth);

        fs.writeFileSync(this.#outputFile, this.#canvas.toBuffer());
    }

    async animate() {
        await this.draw();
        let citation = loadImage(this.#outputFile);

    }

    set height(value) {
        if (value % 2 !== 0) value += 1;

        this.#canvas.height = value;
        this.#height = value;
    }

    set width(value) {
        if (value % 2 !== 0) value += 1;

        this.#canvas.width = value;
        this.#width = value;
    }

    set topBottomDotSize(value) {
        if (value % 2 !== 0) value += 1;
        this.#topBottomDotSize = value;
    }
    set sideDotSize(value) {
        if (value % 2 !== 0) value += 1;
        this.#sideDotSize = value;
    }
    set sideDotSpacing(value) {
        if (value % 2 !== 0) value += 1;
        this.#sideDotSpacing = value;
    }
    set separatorDotSize(value) {
        if (value % 2 !== 0) value += 1;
        this.#separatorDotSize = value;
    }
    set barcodeWidth(value) {
        if (value % 2 !== 0) value += 1;
        this.#barcodeWidth = value;
    }
    set barcodeHeight(value) {
        if (value % 2 !== 0) value += 1;
        this.#barcodeHeight = value;
    }

    /** @param {number[]} value */
    set barcode(value) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== 0 && value[i] !== 1) throw "Barcode can only contain ones and zeros"
        }
        this.#barcode = value;
    }

    /** @return {number} */
    get height() { return this.#height; }
    /** @return {number} */
    get width() { return this.#width; }

    /** @return {number} */
    get topBottomDotSize() { return this.#topBottomDotSize; }

    /** @return {number} */
    get sideDotSize() { return this.#sideDotSize; }
    /** @return {number} */
    get sideDotSpacing() { return this.#sideDotSpacing; }

    /** @return {number} */
    get separatorDotSize() { return this.#separatorDotSize; }

    /** @return {number} */
    get barcodeWidth() { return this.#barcodeWidth; }
    /** @return {number} */
    get barcodeHeight() { return this.#barcodeHeight; }
    /** @return {number[]} */
    get barcode() { return this.#barcode; }
}

