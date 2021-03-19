import { createCanvas } from 'canvas';

/** @typedef {string|CanvasGradient|CanvasPattern} Style */
/** @typedef {"center"|"end"|"left"|"right"|"start"} TextAlignment */

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
export function dottedLine(startX, startY,endX, endY, style, pattern, ctx, width = 1) {
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
export function line(startX, startY,endX, endY, style , ctx, width = 1) {
    ctx.beginPath();
    ctx.strokeStyle = style;
    ctx.setLineDash([]);
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = width
    ctx.stroke();
}

/**
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} font
 * @param {Style} style
 * @param {RenderingContext} ctx
 * @param {TextAlignment} [alignment="left"]
 * @param {number} [maxWidth=0]
 */
export function text(text, x, y, font, style, ctx, alignment = 'left', maxWidth) {
    ctx.fillStyle = style
    ctx.font = font;
    ctx.textAlign = alignment
    if (typeof maxWidth !== 'undefined') {
        const metrics = ctx.measureText(text);
        const size = metrics.emHeightAscent + metrics.emHeightDescent;

        if (maxWidth < 0) maxWidth = 0;
        let width = ctx.measureText(text).width;
        while(width > maxWidth) {
            if (width - maxWidth > maxWidth) text = text.substr(0, text.length - (width / size));
            text = text.substr(0, text.length - 1);

            width = ctx.measureText(text).width
        }
    }
    ctx.fillText(text, x, y);
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
export function textWrapped(str, x, y, font, style, ctx, maxWidth, maxHeight, alignment = "left") {
    let newStr = wrap(str, font, style, ctx, maxWidth)

    if (typeof maxHeight !== 'undefined' && maxHeight > 0 && newStr.includes('\n')) {
        let metrics = ctx.measureText(newStr);
        let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        while (height > maxHeight) {
            newStr = newStr.substr(0, newStr.lastIndexOf('\n'));
            metrics = ctx.measureText(newStr);
            height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }
    }

    text(newStr, x, y, font, style, ctx, alignment, maxWidth);
}

export function wrap(str, font, style, ctx, maxWidth) {
    let words = str.split(" ");
    let lines = [];
    let currentLine = words[0];

    ctx.font = font;
    ctx.style = style;

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines.join('\n');
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
export function barcode(x, y, pattern, barHeight, barWidth, styleFilled, styleEmpty,  ctx) {
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
export function rect(x, y, w, h, style, ctx) {
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
export function textFitsWidth(text, font, ctx, maxWidth) {
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
export function textFitsHeight(text, font, ctx, maxHeight) {
    ctx.font = font;
    let metrics = ctx.measureText(text);
    return metrics.emHeightDescent - (metrics.emHeightAscent / 2) <= maxHeight;
}

export function tint(image, color, opacity = 0.5) {
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
