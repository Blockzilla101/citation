Node.js library to create papers please citations.
### Installation
Needs node.js version `^19.x.x`<br>
Installing with npm `npm i --save @blockzilla101/citation`<br>
Installing with yarn `yarn add @blockzilla101/citation`
### Usage
```js
const { Citation } = require('citation')
const citation = new Citation()
// Optional: width and height can be set in the constructor too
// new Citation(<width>, <height>)

citation.reason = 'reason'
citation.penalty = 'penalty'
citation.title = 'title'
citation.width = 450
citation.height = 200
citation.barcode = [1, 0, 1, 1, 0, 0, 0, 1] // 0 = dont put a line, 1 = put a line; expands leftwards to fit the barcode
citation.resizeReason = true // whether to truncate the reason instead of expanding to fit it

citation.render('citation.png')
// for a gif
citation.render('citation.gif', true)
```
`render()` returns the rendered image or gif as a buffer.
