const { createCanvas, Canvas, loadImage, Image } = require('canvas');
const { text, textWrapped, line, dottedLine, barcode, rect, textFitsHeight, wrap, tint } = require('./util');
const Encoder = require('gif-encoder-2');
const fs = require('fs');

/** @class Citation */
export class Citation {
    /**
     * Background color of the citation
     * @type {string}
     */
    moaBg = '#F3D7E6';
    /**
     * Foreground color of the citation
     * @type {string}
     */
    moaFg = '#BFA8A8';
    /**
     * The font and separator color of the citation
     * @type {string}
     */
    moaFt = '#5A5559';

    /**
     * Width of the citation
     * @type {number}
     */
    #width = 366;
    /**
     * Height of the citation
     * @type {number}
     */
    #height = 160;

    /**
     * Should it resize automatically when text is overflowing
     * @type {boolean}
     */
    resizeReason = false;
    /**
     * Maximum height to resize to before truncating
     * Must be greater then or equal to current height or this parameter is ignored
     * Can cause issues with reason text being very close to the bottom separator
     * @type {number}
    */
    resizeLimit = 0;

    /**
     * The logo put at the mid-bottom the citation
     * @type {Image}
     */
    #logo = null

    /**
     * @type {Canvas}
     */
    #canvas = null;
    /**
     * @type {RenderingContext}
     */
    #ctx = null;

    /**
     * Title of the citation
     * @type {string}
     */
    title = "M.O.A. CITATION";
    /**
     * Content/Reason for the citation
     * @type {string}
     */
    reason = 'Protocol Violated.\nEntry Permit: Invalid Name';
    /**
     * Penalties of the citation
     * @type {string}
     */
    penalty = 'LAST WARNING - NO PENALTY';

    /**
     * The barcode at the top left penalty
     * @type {number[]}
     */
    #barcode = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1];

    /**
     * Dot size for the dotted line at the top & bottom
     * @type {number}
     */
    topBottomDotSize = 2;
    /**
     * Dot size for the dots at the sides of the citation
     * @type {number}
     */
    sideDotSize = 6;
    /**
     * Spacing between the dots at the sides of the citation
     * @type {number}
     */
    sideDotSpacing = 4;
    /**
     * Size of dots in the dotted lines that separate the title, reason and penalty
     * @type {number}
     */
    separatorDotSize = 2;
    /**
     * Width of each strip of the barcode
     * @type {number}
     */
    barcodeWidth = 2;
    /**
     * Height of each strip of the barcode <br>
     * Dot at the left is half of this height
     * @type {number}
     */
    barcodeHeight = 12;
    /**
     * Size of the font used to render
     * @type {number}
     */
    fontSize = 16;
    /**
     * Scale of the rendered logo
     * @type {number}
     */
    logoScale = 1;

    /**
     * For verbose logging
     */
    log = (...args) => { }

    /**
     * @param {number} [width=366]
     * @param {number} [height=160]
     */
    constructor(width = 366, height = 160) {
        this.width = width;
        this.height = height;
    }

    /**
     * Instantiates the canvas and loads the logo
     * @return {Promise<void>}
     */
    async #createCanvas() {
        this.#canvas = createCanvas(this.#width, this.#height);
        this.#ctx = this.#canvas.getContext('2d');

        this.#ctx.imageSmoothingEnabled = false;
        this.#ctx.antialias = 'none';

        if (!this.#logo) this.#logo = await loadImage(`${__dirname + '/../data'}/logo.png`);
    }

    /**
     * @param {string} [out] Path to output file
     * @param {boolean} [gif=false] Render a gif version
     * @param {number} [frameRate=10] Frame rate of the rendered gif
     * @param {number[]} [yPos=null] Y position of the citation at each frame
     * @return {Promise<Buffer>} The rendered gif or png. If **out** is specified then it also gets piped into that file
     */
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

        if (this.resizeReason) {
            let wrapped = wrap(this.reason, this.font, this.moaFt, this.#ctx, this.#reasonMaxWidth)
            const ogHeight = this.#height
            if (!textFitsHeight(wrapped, this.font, this.#ctx, this.#reasonMaxHeight)) {
                this.#ctx.font = this.font
                let metrics = this.#ctx.measureText(wrapped);
                this.#canvas.height += (metrics.emHeightDescent - (metrics.emHeightAscent / 2)) - this.#reasonMaxHeight;
                this.#height = this.#canvas.height
                if (this.resizeLimit > ogHeight) {
                    if (this.#height > this.resizeLimit) {
                        this.#canvas.height = this.resizeLimit
                        this.#height = this.resizeLimit
                    }
                }
            }
            this.height = this.#canvas.height
        }

        // Bg
        rect(0, 0, this.width, this.height, this.moaBg, this.#ctx);

        // Logo
        this.#ctx.drawImage(tint(this.#logo, this.moaFg), (this.#width / 2) - ((this.#logo.height * this.logoScale) / 2) - 1, this.height - (this.#bottomSeparatorSpacingFromBottom + ((this.#logo.height * this.logoScale) / 2)) + 4, this.#logo.width * this.logoScale, this.#logo.height * this.logoScale);

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

    /**
     * @param {number} [frameRate=10]
     * @param {number[]} [yPos=null]
     *      Y position of the citation at each frame<br>
     *      Default: Starts at first big at the size,
     *      keeps incrementing by 2 till the first separator,
     *      waits there for 14 frames,
     *      then keeps incrementing by 2 till the second/last separator,
     *      waits there for 14 frames,
     *      then keeps incrementing by 2 till the entire citation is visible / y value = 0,
     *      waits for 100 frames,
     *      starts decrementing by 2 till the entire citation is gone / y value = height of citation
     * @return {Promise<Buffer>} The rendered gif
     */
    async #animated(frameRate = 10, yPos = null) {
        const encoder = new Encoder(this.#width, this.#height);
        const canvas = createCanvas(this.#width, this.#height);
        const ctx = canvas.getContext('2d')

        // stores y values of citation position
        const animation = yPos ?? [];

        if (!yPos) {
            let increments = 2;
            let pause = 14;
            let bigPause = 100;

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

        encoder.setFrameRate(frameRate)
        encoder.useOptimizer = true
        encoder.setQuality(1);
        encoder.setThreshold(100);
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

    set width(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        if (value % 2 !== 0) {
            this.log(`width ${value} is not even | added one too it`)
            value += 1
        }
        if (value < 100) throw new Error(`width can't be smaller then 100`)
        this.#width = Math.round(value);
    }

    set height(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        if (value % 2 !== 0) {
            this.log(`width ${value} is not even | added one too it`)
            value += 1
        }
        if (value < 110) throw new Error(`height be smaller then 110`)
        this.#height = Math.round(value);
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
        this.#ctx.font = this.font
        const metrics = this.#ctx.measureText(this.title)
        return this.topBottomDotSize + (this.title.includes('\n') ? metrics.emHeightDescent + 3: metrics.actualBoundingBoxAscent * 2 - 2)
    }
    get #bottomSeparatorSpacingFromBottom() {
        return this.topBottomDotSize + (this.fontSize * 2) + 10
    }

    get #barcodeSpacingFromRight() {
        return this.#sideDotsSpacingFromRight + this.sideDotSize + 8
    }
    get #barcodeSpacingFromTop() {
        return this.#topSeparatorSpacingFromTop - this.#titleSpacingFromTop
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
        this.#ctx.font = this.font
        const metrics = this.#ctx.measureText(this.reason)
        return this.#topSeparatorSpacingFromTop + (this.fontSize / 2) + (metrics.actualBoundingBoxAscent)
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
