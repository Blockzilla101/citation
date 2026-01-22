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
### Output
![514702888-d958099e-52db-415c-8c12-55193f49573f](https://github.com/user-attachments/assets/f2bd3de1-2854-4750-9347-49f41376815e)
<img width="450" height="200" alt="514702890-34095a61-1e79-4bc8-a792-198b5c14ace6" src="https://github.com/user-attachments/assets/6b269a7d-1609-4088-960e-d02bd157ca95" />
