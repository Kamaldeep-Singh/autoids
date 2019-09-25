const fs = require('fs')
const parser = require('xml-js')
const Shell = require('./shell')

const types = [
    'view',
    'imageView',
    'collectionView',
    'tableView',
    'tableViewCell',
    'tableViewCellContentView',
    'label',
    'textField',
    'button',
    'navigationItem',
    'barButtonItem',
    'switch'
    // add more types here
]

const excluded = [
    'constraints',
    'constraint',
    'color',
    'namedColor',
    'accessibility',
    'rect',
    'action',
    'inferredMetricsTieBreakers',
    'image',
    'exit',
    'connections',
    'outlet',
    'nil',
    'fontDescription',
    'autoresizingMask'
]

const traverse = (element) => {
    if (!element || excluded.includes(element.name)) {
        return
    }

    if (types.includes(element.name)) {
        if (!element.elements) {
            element.elements = []
        }
        const accessibility = {
            type: 'element',
            name: 'accessibility',
            attributes: {
                key: 'accessibilityConfiguration',
                identifier: `${element.attributes.id}`
            }
        }
        element.elements.push(accessibility)
    }
    if (element.elements) {
        element.elements.forEach( child => traverse(child))
    }
}

const main = async () => {
    const args = process.argv.slice(2)

    if (!args || args.length == 0) {
        console.error('Please provide project folder to recursively find and update all the storyboards/xibs.')
        return
    }
    
    const xibs = await Shell.execute(`find ${args[0]} -type f -name "*.xib"`)
    const storyboards = await Shell.execute(`find ${args[0]} -type f -name "*.storyboard"`)
    const paths = [...xibs.split('\n'), ...storyboards.split('\n')].filter(v => v != '')

    paths.forEach((file) => {
        const filepath = `${file}`
        
        console.log(`Updating ${filepath}`)
        
        const xml = fs.readFileSync(filepath)
        var json = parser.xml2json(xml, {compact: false, spaces: 4, attributeValueFn: (value) => {
            return value.replace('&', '&amp;')
          }
        })
        var result = JSON.parse(json)
    
        if (!result) {
            console.error("Invalid json")
            return
        }
        traverse(result)
    
        const content = parser.json2xml(result, {compact: false, spaces: 4})
        fs.writeFileSync(filepath, content)
    })
}
main()