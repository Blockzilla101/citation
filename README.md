Node.js library to create papers please citations.
### Installation
Needs node.js version `15.x.x`<br>
Installing with npm `npm i --save Blockzilla101/citation`<br>
Installing with yarn `yarn add Blockzilla101/citation`
### Usage
```js
const { Citation } = require('citation')
const citation = new Citation()

citation.reason = 'reason'
citation.penalty = 'penalty'

citation.render('citation.png')
```
for a gif version `citation.render('citation.gif', true)`.<br>
`height` and `width` can be changed using `citation.height` and `citation.width`. <br>
to wrap reason instead of truncating it `citation.wrapReason = true`. <br>
`citation.render()` returns the rendered image as a buffer.
