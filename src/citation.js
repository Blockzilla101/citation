const { createCanvas, Canvas, loadImage, Image } = require('canvas');
const { text, textWrapped, line, dottedLine, barcode, rect, textFitsHeight, textFitsWidth } = require('./util');
const Encoder = require('gif-encoder-2');

const fs = require('fs');

/** @class Citation */
module.exports.Citation = class Citation {
    /** @type {string|*} Background color of the citation */
    moaBg = '#F3D7E6';
    /** @type {string|*} Foreground color of the citation */
    moaFg = '#BFA8A8';
    /** @type {string|*} The font and separator color of the citation */
    moaFt = '#5A5559';

    /** @type {number} Width of the citation*/
    #width = 366;
    /** @type {number} Height of the citation */
    #height = 160;

    /** @type {boolean} Should it resize automatically when text is overflowing */
    autoResizeToText = false;

    /** @type {Image} The logo put at the mid-bottom the citation */
    #logo = null

    /** @type {RenderingContext} */
    #ctx = null;
    /** @type {Canvas} */
    #canvas = null;

    /** @type {string} Title of the citation*/
    title = "M.O.A. CITATION";
    /** @type {string} Content/Reason for the citation*/
    reason = 'Protocol Violated.\nEntry Permit: Invalid Name';
    /** @type {string} Penalties of the citation*/
    penalty = 'LAST WARNING - NO PENALTY';

    /** @type {number[]} The barcode at the top left */
    #barcode = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1];

    /** @type {number} Dot size for the dashed line at the top and bottom */
    topBottomDotSize = 2;
    /** @type {number} Dot size for the dots at the sides of the citation */
    sideDotSize = 6;
    /** @type {number} Spacing between the dots at the sides of the citation */
    sideDotSpacing = 4;
    /** @type {number} Separator dot size */
    separatorDotSize = 2;
    /** @type {number} */
    barcodeWidth = 2;
    /** @type {number} */
    barcodeHeight = 12;
    /** @type {number} */
    fontSize = 16;

    log = (...args) => { }

    /**
     * @param {number} [width=366]
     * @param {number} [height=160]
     */
    constructor(width = 366, height = 160) {
        this.width = width;
        this.height = height;
    }

    async #createCanvas() {
        this.#canvas = createCanvas(this.#width, this.#height);
        this.#ctx = this.#canvas.getContext('2d');

        this.#ctx.imageSmoothingEnabled = false;
        this.#ctx.antialias = 'none';

        if (!this.#logo) this.#logo = await loadImage(`${__dirname + '/../data'}/logo.png`);
    }

    async render(out, gif = false, frameRate = 10, yPos = null) {
        await this.#draw()
        let data = gif ? await this.#animated(frameRate, yPos) : this.#canvas.toBuffer()
        if (out) {
            fs.writeFileSync(out, data)
        }
        return data
    }

    async #draw() {
        await this.#createCanvas()

        if (this.autoResizeToText) {
            while (!textFitsWidth(this.title, this.font, this.#ctx, this.#titleMaxWidth)) {
                this.#canvas.width += this.#ctx.measureText(this.title).width * 0.1;
                this.#width = this.#canvas.width;
            }

            while (!textFitsWidth(this.penalty, this.font, this.#ctx, this.#titleMaxWidth)) {
                this.#canvas.width += this.#ctx.measureText(this.penalty).width * 0.1;
                this.#width = this.#canvas.width;
            }

            while (!textFitsHeight(this.reason, this.font, this.#ctx, this.#reasonMaxHeight)) {
                let metrics = this.#ctx.measureText(this.reason);
                this.#canvas.height += (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 0.03;
                this.#height = this.#canvas.height;
            }
            
            // while (!textFitsWidth(this.reason, this.#font, this.#ctx, this.#reasonMaxWidth)) {
            //     this.#canvas.width += this.#ctx.measureText(this.reason).width * 0.1;
            //     this.#width = this.#canvas.width;
            // }
        }

        // Bg
        rect(0, 0, this.width, this.height, this.moaBg, this.#ctx);

        // Logo
        this.#ctx.drawImage(this.#logo, (this.#width / 2) - (this.#logo.height / 2) - 1, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.#logo.height / 2)) + 4);

        // Top and bottom dots
        dottedLine(0, this.topBottomDotSize / 2, this.#width, this.topBottomDotSize / 2, this.moaFg, [this.topBottomDotSize, this.topBottomDotSize], this.#ctx, this.topBottomDotSize);
        dottedLine(this.topBottomDotSize, this.#height - this.topBottomDotSize / 2, this.#width, this.#height - this.topBottomDotSize / 2, this.moaFg, [this.topBottomDotSize, this.topBottomDotSize], this.#ctx, this.topBottomDotSize);

        // Dots on the sides
        dottedLine(this.#sideDotsSpacingFromLeft + (this.sideDotSize / 2), this.#sideDotsSpacingFromTop, this.#sideDotsSpacingFromLeft + (this.sideDotSize / 2), this.#height - this.topBottomDotSize, this.moaFg, [this.sideDotSize, this.sideDotSize * 2], this.#ctx, this.sideDotSize);
        dottedLine(this.#width - this.#sideDotsSpacingFromRight - (this.sideDotSize / 2), this.#sideDotsSpacingFromTop, this.#width - this.#sideDotsSpacingFromRight - (this.sideDotSize / 2), this.#height - this.topBottomDotSize, this.moaFg, [this.sideDotSize, this.sideDotSize * 2], this.#ctx, this.sideDotSize);

        // Separators
        dottedLine(this.#separatorSpacingFromLeft, this.#topSeparatorSpacingFromTop + (this.separatorDotSize / 2), this.#width - this.#separatorSpacingFromRight, this.#topSeparatorSpacingFromTop + (this.separatorDotSize / 2), this.moaFt, [this.separatorDotSize, this.separatorDotSize], this.#ctx, this.separatorDotSize);
        dottedLine(this.#separatorSpacingFromLeft, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.separatorDotSize / 2)), this.#width - this.#separatorSpacingFromRight, this.height - (this.#bottomSeparatorSpacingFromBottom + (this.separatorDotSize / 2)), this.moaFt, [this.separatorDotSize, this.separatorDotSize], this.#ctx, this.separatorDotSize);

        // Line at the side
        line(this.#width - (this.topBottomDotSize / 2), 0, this.#width - (this.topBottomDotSize / 2), this.#height, this.moaFg, this.#ctx, this.topBottomDotSize);

        // Barcode
        barcode(this.#width - this.#barcodeSpacingFromRight - (this.#barcode.length * this.barcodeWidth), this.#barcodeSpacingFromTop, this.#barcode, this.barcodeHeight, this.barcodeWidth, this.moaFt, this.moaBg, this.#ctx);
        rect(this.#width - this.#barcodeSpacingFromRight - (this.#barcode.length * this.barcodeWidth) - (this.barcodeWidth * 3), this.#barcodeSpacingFromTop, this.barcodeWidth * 2, this.barcodeHeight / 2, this.moaFt, this.#ctx);

        // Title
        text(this.title, this.#textSpacingFromLeft, this.#titleSpacingFromTop, this.font, this.moaFt, this.#ctx, 'left', this.#titleMaxWidth);

        // Reason
        textWrapped(this.reason, this.#textSpacingFromLeft, this.#reasonSpacingFromTop, this.font, this.moaFt, this.#ctx, this.#reasonMaxWidth, this.#reasonMaxHeight)

        // Penalty
        text(this.penalty, (this.#width / 2) - 3, this.#height - this.#penaltySpacingFromBottom, this.font, this.moaFt, this.#ctx, 'center', this.#reasonMaxWidth);
    }

    async #animated(frameRate = 10, yPos = null) {
        const encoder = new Encoder(this.#width, this.#height);
        const canvas = createCanvas(this.#width, this.#height);
        const ctx = canvas.getContext('2d');

        let increments = 2;
        let pause = 14;
        let bigPause = 100;

        // stores y values of citation position
        const animation = yPos ?? [];

        if (!yPos) {
            let startingPoint = this.#sideDotsSpacingFromTop;
            let stopOne = this.#topSeparatorSpacingFromTop + increments;
            let stopTwo = this.height - this.#bottomSeparatorSpacingFromBottom + increments;

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
        }

        encoder.setDelay(10);
        encoder.setQuality(1);
        encoder.useOptimizer = true;
        encoder.setThreshold(1);
        encoder.setTransparent('#00000000')

        encoder.start();
        for (let i = 0; i < animation.length; i++) {
            ctx.clearRect(0, 0, this.#width, this.#height);
            ctx.drawImage(this.#canvas, 0, this.#height - animation[i]);
            encoder.addFrame(ctx);
            this.log(`\rEncoding frame ${i+1} of ${animation.length}`)
        }
        encoder.finish();
        this.log('\nEncoding Finished\n')
        return encoder.out.getData()
    }

    set height(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        if (value % 2 !== 0) {
            this.log(`width ${value} is not even | added one too it`)
            value += 1
        }
        this.#height = value;
    }

    set width(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        if (value % 2 !== 0) {
            this.log(`width ${value} is not even | added one too it`)
            value += 1
        }
        this.#width = value;
    }

    /** @param {number[]} value */
    set barcode(value) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== 0 && value[i] !== 1) throw new Error("Barcode can only contain ones and zeros")
        }
        this.#barcode = value;
    }

    /** @return The f*/
    get font() {
        return `${this.fontSize}px BMmini`;
    }

    /** @return {number} */
    get height() { return this.#height; }
    /** @return {number} */
    get width() { return this.#width; }

    //#region Private Getters
    get #sideDotsSpacingFromLeft() {
        return this.sideDotSpacing
    }
    get #sideDotsSpacingFromTop() {
        return this.sideDotSpacing + this.topBottomDotSize
    }
    get #sideDotsSpacingFromRight() {
        return this.sideDotSpacing + (this.topBottomDotSize) + 2
    }

    get #separatorSpacingFromLeft() {
        return this.#sideDotsSpacingFromLeft + this.sideDotSize + 6
    }
    get #separatorSpacingFromRight() {
        return this.#sideDotsSpacingFromRight + this.sideDotSize + 6
    }

    get #topSeparatorSpacingFromTop() {
        return this.topBottomDotSize + (this.fontSize * 2)
    }
    get #bottomSeparatorSpacingFromBottom() {
        return this.topBottomDotSize + (this.fontSize * 2) + 10
    }

    get #barcodeSpacingFromRight() {
        return this.#sideDotsSpacingFromRight + this.sideDotSize + 8
    }
    get #barcodeSpacingFromTop() {
        return this.topBottomDotSize + 4
    }
    get #textSpacingFromLeft() {
        return this.sideDotSpacing + this.sideDotSize + 12
    }

    get #titleSpacingFromTop() {
        return this.topBottomDotSize + this.fontSize + 2
    }
    get #titleMaxWidth() {
        return this.#width - (this.#barcodeSpacingFromRight + (this.#barcode.length * this.barcodeWidth) + (this.barcodeWidth * 3) + this.#textSpacingFromLeft + this.fontSize)
    }

    get #reasonSpacingFromTop() {
        return this.#topSeparatorSpacingFromTop + this.separatorDotSize + this.fontSize + 4
    }
    get #reasonMaxWidth() {
        return this.#width - (this.#textSpacingFromLeft + this.#sideDotsSpacingFromRight + this.sideDotSize)
    }
    get #reasonMaxHeight() {
        return this.#height - (this.#topSeparatorSpacingFromTop + this.#bottomSeparatorSpacingFromBottom + this.fontSize)
    }

    get #penaltySpacingFromBottom() {
        return this.#bottomSeparatorSpacingFromBottom - this.fontSize - 10
    }
    //#endregion Private Getters
}
