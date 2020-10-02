const { createCanvas, Canvas, registerFont, loadImage, Image } = require('canvas');
const { text, textWrapped, line, dottedLine, barcode, rect, textFitsHeight, textFitsWidth } = require('./util');
const Encoder = require('gif-encoder-2');

const fs = require('fs');

function loadAssets() {
    const font = 'BMmini.ttf', altFont = 'megan_serif.ttf';
    const logoFile = 'logo.png'
    const dataDir = __dirname + '/../data';

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
    reason = 'Protocol Violated.\nEntry Permit: Invalid Name';
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

    /** @type {number|null} */
    #sideDotsSpacingFromLeft = null;
    /** @type {number|null} */
    #sideDotsSpacingFromTop = null;
    /** @type {number|null} */
    #sideDotsSpacingFromRight = null;

    /** @type {number|null} */
    #separatorSpacingFromLeft = null;
    /** @type {number|null} */
    #separatorSpacingFromRight = null;

    /** @type {number|null} */
    #topSeparatorSpacingFromTop = null;
    /** @type {number|null} */
    #bottomSeparatorSpacingFromBottom = null;

    /** @type {number|null} */
    #barcodeSpacingFromRight = null;
    /** @type {number|null} */
    #barcodeSpacingFromTop = null;

    /** @type {number|null} */
    #textSpacingFromLeft = null;

    /** @type {number|null} */
    #titleSpacingFromTop = null;
    /** @type {number|null} */
    #titleMaxWidth = null;

    /** @type {number|null} */
    #reasonSpacingFromTop = null;
    /** @type {number|null} */
    #reasonMaxWidth = null;
    /** @type {number|null} */
    #reasonMaxHeight = null;

    /** @type {number|null} */
    #penaltySpacingFromBottom = null;

    /**
     * @param {string} outputFile
     * @param {number} [width=366]
     * @param {number} [height=160]
     */
    constructor(outputFile, width = 366, height = 160) {
        this.#outputFile = outputFile;

        this.#canvas = createCanvas(this.#width, this.#height);
        this.#ctx = this.#canvas.getContext('2d');

        this.width = width;
        this.height = height;

        this.#ctx.imageSmoothingEnabled = false;
        this.#ctx.antialias = 'none';
    }

    async generate() {
        await this.#draw();
        fs.writeFileSync(this.#outputFile, this.#canvas.toBuffer())
    }

    #draw = async () => {
        this.calculate();

        if (this.#autoResizeToText) {
            while (!textFitsWidth(this.title, this.#font, this.#ctx, this.#titleMaxWidth)) {
                this.#canvas.width += this.#ctx.measureText(this.title).width * 0.1;
                this.#width = this.#canvas.width;
                this.calculate();
            }

            while (!textFitsWidth(this.penalty, this.#font, this.#ctx, this.#titleMaxWidth)) {
                this.#canvas.width += this.#ctx.measureText(this.penalty).width * 0.1;
                this.#width = this.#canvas.width;
                this.calculate();
            }

            while (!textFitsWidth(this.reason, this.#font, this.#ctx, this.#reasonMaxWidth)) {
                this.#canvas.width += this.#ctx.measureText(this.reason).width * 0.1;
                this.#width = this.#canvas.width;
                this.calculate();
            }

            while (!textFitsHeight(this.reason, this.#font, this.#ctx, this.#reasonMaxHeight)) {
                let metrics = this.#ctx.measureText(this.reason);
                this.#canvas.height += (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 0.03;
                this.#height = this.#canvas.height;
                this.calculate();
            }
        }

        // Bg
        rect(0, 0, this.width, this.height, this.moaBg, this.#ctx);

        // Logo
        this.#logo = await loadImage(`${__dirname + '/../data'}/logo.png`);
        this.#ctx.drawImage(this.#logo, (this.#width / 2) - (this.#logo.height / 2) - 1, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.#logo.height / 2)) + 4);

        // Top and bottom dots
        dottedLine(0, this.#topBottomDotSize / 2, this.#width, this.#topBottomDotSize / 2, this.moaFg, [this.#topBottomDotSize, this.#topBottomDotSize], this.#ctx, this.#topBottomDotSize);
        dottedLine(this.#topBottomDotSize, this.#height - this.#topBottomDotSize / 2, this.#width, this.#height - this.#topBottomDotSize / 2, this.moaFg, [this.#topBottomDotSize, this.#topBottomDotSize], this.#ctx, this.#topBottomDotSize);

        // Dots on the sides
        dottedLine(this.#sideDotsSpacingFromLeft + (this.#sideDotSize / 2), this.#sideDotsSpacingFromTop, this.#sideDotsSpacingFromLeft + (this.#sideDotSize / 2), this.#height - this.#topBottomDotSize, this.moaFg, [this.#sideDotSize, this.#sideDotSize * 2], this.#ctx, this.#sideDotSize);
        dottedLine(this.#width - this.#sideDotsSpacingFromRight - (this.#sideDotSize / 2), this.#sideDotsSpacingFromTop, this.#width - this.#sideDotsSpacingFromRight - (this.#sideDotSize / 2), this.#height - this.#topBottomDotSize, this.moaFg, [this.#sideDotSize, this.#sideDotSize * 2], this.#ctx, this.#sideDotSize);

        // Separators
        dottedLine(this.#separatorSpacingFromLeft, this.#topSeparatorSpacingFromTop + (this.#separatorDotSize / 2), this.#width - this.#separatorSpacingFromRight, this.#topSeparatorSpacingFromTop + (this.#separatorDotSize / 2), this.moaFt, [this.#separatorDotSize, this.#separatorDotSize], this.#ctx, this.#separatorDotSize);
        dottedLine(this.#separatorSpacingFromLeft, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.#separatorDotSize / 2)), this.#width - this.#separatorSpacingFromRight, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.#separatorDotSize / 2)), this.moaFt, [this.#separatorDotSize, this.#separatorDotSize], this.#ctx, this.#separatorDotSize);

        // Line at the side
        line(this.#width - (this.#topBottomDotSize / 2), 0, this.#width - (this.#topBottomDotSize / 2), this.#height, this.moaFg, this.#ctx, this.#topBottomDotSize);

        // Barcode
        barcode(this.#width - this.#barcodeSpacingFromRight - (this.#barcode.length * this.#barcodeWidth), this.#barcodeSpacingFromTop, this.#barcode, this.#barcodeHeight, this.#barcodeWidth, this.moaFt, this.moaBg, this.#ctx);
        rect(this.#width - this.#barcodeSpacingFromRight - (this.#barcode.length * this.#barcodeWidth) - (this.#barcodeWidth * 3), this.#barcodeSpacingFromTop, this.#barcodeWidth * 2, this.#barcodeHeight / 2, this.moaFt, this.#ctx);

        // Title
        text(this.title, this.#textSpacingFromLeft, this.#titleSpacingFromTop, this.#font, this.moaFt, this.#ctx, 'left', this.#titleMaxWidth);

        // Reason
        textWrapped(this.reason, this.#textSpacingFromLeft, this.#reasonSpacingFromTop, this.#font, this.moaFt, this.#ctx, this.#reasonMaxWidth, this.#reasonMaxHeight)

        // Penalty
        text(this.penalty, (this.#width / 2) - 3, this.#height - this.#penaltySpacingFromBottom, this.#font, this.moaFt, this.#ctx, 'center', this.#reasonMaxWidth);
    }

    async animated() {
        await this.#draw();

        const encoder = new Encoder(this.#width, this.#height);
        const canvas = createCanvas(this.#width, this.#height);

        let ctx = canvas.getContext('2d');

        /**
         * @param {number} amount
         * @param {Canvas} canvas
         */
        function moveBy(amount, canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvas, 0, amount); encoder.addFrame(ctx);
        }

        let increments = 2;
        let pause = 14;
        let bigPause = 100;

        let startingPoint = this.#sideDotsSpacingFromTop;
        let stopOne = this.#topSeparatorSpacingFromTop + increments;
        let stopTwo = this.height - this.#bottomSeparatorSpacingFromBottom + increments;

        const animation = [];

        animation.push(startingPoint)
        for (let i = startingPoint + increments; i < stopOne; i += increments) {
            animation.push(i);
        }

        for (let i = 0; i < pause; i++) animation.push(stopOne);
        for (let i = stopOne + increments; i < stopTwo; i += increments) {
            animation.push(i);
        }

        for (let i = 0; i < pause; i++) animation.push(stopTwo);
        for (let i = stopTwo + increments; i < this.#height; i += increments) {
            animation.push(i);
        }

        for (let i = 0; i < bigPause; i++) animation.push(this.#height);

        for (let i = this.#height; i >= 0; i -= increments) {
            animation.push(i);
        }

        for (let i = 0; i < bigPause / 2; i++) animation.push(0);

        encoder.setDelay(10);
        encoder.setQuality(1);
        encoder.useOptimizer = true;
        encoder.setThreshold(1);
        encoder.setTransparent('#00000000')

        encoder.start();
        for (let i = 0; i < animation.length; i++) {
            moveBy(this.#height - animation[i], this.#canvas);
        }
        encoder.finish();

        fs.writeFileSync(this.#outputFile, encoder.out.getData())
    }

    /**
     * Recalculates the values variables that make up the citation
     */
    calculate() {
        this.#sideDotsSpacingFromLeft = this.#sideDotSpacing;
        this.#sideDotsSpacingFromTop = this.#sideDotSpacing + this.#topBottomDotSize;
        this.#sideDotsSpacingFromRight = this.#sideDotSpacing + (this.#topBottomDotSize) + 2;

        this.#separatorSpacingFromLeft = this.#sideDotsSpacingFromLeft + this.#sideDotSize + 6;
        this.#separatorSpacingFromRight = this.#sideDotsSpacingFromRight + this.#sideDotSize + 6;

        this.#topSeparatorSpacingFromTop = this.#topBottomDotSize + (this.#fontSize * 2);
        this.#bottomSeparatorSpacingFromBottom = this.#topBottomDotSize + (this.#fontSize * 2) + 10;

        this.#barcodeSpacingFromRight = this.#sideDotsSpacingFromRight + this.#sideDotSize + 8;
        this.#barcodeSpacingFromTop = this.#topBottomDotSize + 4;

        this.#textSpacingFromLeft = this.#sideDotSpacing + this.#sideDotSize + 12;

        this.#titleSpacingFromTop = this.#topBottomDotSize + this.#fontSize + 2;
        this.#titleMaxWidth = this.#width - (this.#barcodeSpacingFromRight + (this.#barcode.length * this.#barcodeWidth) + (this.#barcodeWidth * 3) + this.#textSpacingFromLeft + this.#fontSize);

        this.#reasonSpacingFromTop = this.#topSeparatorSpacingFromTop + this.#separatorDotSize + this.#fontSize + 4;
        this.#reasonMaxWidth = this.#width - (this.#textSpacingFromLeft + this.#sideDotsSpacingFromRight + this.#sideDotSize);
        this.#reasonMaxHeight = this.#height - (this.#topSeparatorSpacingFromTop + this.#bottomSeparatorSpacingFromBottom + this.#fontSize);

        this.#penaltySpacingFromBottom = this.#bottomSeparatorSpacingFromBottom - this.#fontSize - 10;
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

    /** @param {boolean} value Note: doesn't scales well **/
    set autoResizeToText(value) {
        this.#autoResizeToText = value;
    }

    /** @param {number} value WARNING: Does not scale well**/
    set fontSize(value) {
        this.#fontSize = value;
        this.#font = `${value}px BMmini`;
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

    /** @return {boolean} */
    get autoResizeToText() { return this.#autoResizeToText; }

    /** @return {number} **/
    get fontSize() { return this.#fontSize; }

    /** @return {string} **/
    get outputFile() { return this.#outputFile }
}
