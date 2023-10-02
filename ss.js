const fs = require('fs')
const path = require('path')
let result = ''
let fileList = fs.readdirSync('./download').map(item=>item.match(/\d+/g)[0]).sort((a,b)=>a-b).map(item=>`video${item}.ts`)
fileList.forEach(item=>{
    let file = path.join(__dirname, `/download/${item}`)
    result += `file '${file}'\n`
})
fs.writeFileSync('file.txt',result,'utf-8')