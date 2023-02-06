const { createCanvas, SKRSContext2D } = require('@napi-rs/canvas');

/** @typedef {SKRSContext2D} RenderingContext*/
/** @typedef {string|CanvasGradient|CanvasPattern} Style*/
/** @typedef {"center"|"end"|"left"|"right"|"start"} TextAlignment*/

/**
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {Style} style
 * @param {number[]} pattern
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} [width=1]
 */
function dottedLine(startX, startY,endX, endY, style, pattern, ctx, width = 1) {
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.setLineDash(pattern);
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = width
    ctx.stroke();
}

/**
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {Style} style
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} [width=1]
 */
function line(startX, startY,endX, endY, style , ctx, width = 1) {
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.setLineDash([]);
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = width
    ctx.stroke();
}

/**
 * @param {string} fillText
 * @param {number} x
 * @param {number} y
 * @param {string} font
 * @param {Style} style
 * @param {RenderingContext} ctx
 * @param {TextAlignment} [alignment="left"]
 * @param {number} [maxWidth=0]
 */
function text(fillText, x, y, font, style, ctx, alignment = 'left', maxWidth) {
    if (fillText.includes('\n')) {
        const metrics = ctx.measureText(fillText)
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 2
        
        let currY = y;
        const lines = fillText.split('\n')
        for (const line of lines) {
            text(line, x, currY, font, style, ctx, alignment, maxWidth)
            currY += height
        }

        return
    }

    ctx.fillStyle = style
    ctx.strokeStyle = style
    ctx.font = font;
    ctx.textAlign = alignment

    console.log(x, y)

    ctx.fillText(fillText, x, y, maxWidth);
}

/**
 * @param {string} str
 * @param {number} x
 * @param {number} y
 * @param {string} font
 * @param {Style} style
 * @param {RenderingContext} ctx
 * @param {number} maxWidth
 * @param {number} [maxHeight]
 * @param {TextAlignment} [alignment="left"]
 */
function textWrapped(str, x, y, font, style, ctx, maxWidth, maxHeight, alignment = "left") {
    let newStr = wrap(str, font, style, ctx, maxWidth)
    text(newStr, x, y, font, style, ctx, alignment, maxWidth);
}

function wrap(str, font, style, ctx, maxWidth) {
    ctx.font = font;
    ctx.fillStyle = style

    const lines = str.split('\n')
    const newStr = []
    for (const line of lines) {
        const words = line.split(' ');
        let currStr = []
        for (const word of words) {
            currStr.push(word)
            if (ctx.measureText(currStr.join(' ')).width > maxWidth) {
                const lastWord = currStr.pop()
                newStr.push(currStr.join(' '))
                currStr = []
                currStr.push(lastWord)
            }
        }
        newStr.push(currStr.join(' ').trim())
    }

    return newStr.join('\n').trim()
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} barWidth
 * @param {number} barHeight
 * @param {number[]} pattern
 * @param {Style} styleFilled
 * @param {Style} styleEmpty
 * @param {RenderingContext} ctx
 */
function barcode(x, y, pattern, barHeight, barWidth, styleFilled, styleEmpty,  ctx) {
    for (let i = 0; i < pattern.length; i++) {
        line(x + (barWidth * i) + (barWidth / 2), y, x + (barWidth * i) + (barWidth / 2), y + barHeight, (pattern[i] === 0 ? styleEmpty : styleFilled), ctx, barWidth);
    }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string|Style} style
 * @param {RenderingContext} ctx
 */
function rect(x, y, w, h, style, ctx) {
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
}

/**
 * @param {string} text
 * @param {string} font
 * @param {RenderingContext} ctx
 * @param {number|null} maxWidth
 * @return {boolean}
 */
function textFitsWidth(text, font, ctx, maxWidth) {
    ctx.font = font;
    return ctx.measureText(text).width <= maxWidth;
}

/**
 * @param {string} text
 * @param {string} font
 * @param {RenderingContext} ctx
 * @param {number} maxHeight
 * @return {boolean}
 */
function textFitsHeight(text, font, ctx, maxHeight) {
    ctx.font = font;
    let metrics = ctx.measureText(text);
    return (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 2) * text.split('\n').length <= maxHeight;
}

function tint(image, color, opacity = 0.5) {
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-atop"
    ctx.globalAlpha = 1;
    ctx.drawImage(image, 0, 0);
    return canvas
}

module.exports = {
    line,
    dottedLine,
    rect,
    barcode,
    textWrapped,
    text,
    textFitsHeight,
    textFitsWidth,
    wrap,
    tint
}
