const fs = require('fs')
const path = require('path')

module.exports = {
    write
}

function write () {
    const testsFilePath = path.join(global.applicationPath, 'tests.txt')
    if (!fs.existsSync(testsFilePath)) {
      return
    }
    let tests = fs.readFileSync(testsFilePath).toString()
    tests = tests.substring(0, tests.indexOf('internal-api'))
    tests = tests.split('\n')
    let start = false
    const properties = {}
    let lastProperty
    for (const i in tests) {
      const line = tests[i].trim()
      if (!line.length) {
        continue
      }
      if (!start) {
        if (line === 'index') {
          start = true
        }
        continue
      }
      if (line.indexOf(' ') === -1) {
        lastProperty = line
        properties[lastProperty] = {}
        continue
      }     
      if (!lastProperty) {
        continue
      }
      if (!properties[lastProperty].description) {
        properties[lastProperty].description = line
        continue
      }  
      if(line.indexOf('default') > -1) {
        properties[lastProperty].default = line.substring('✓ default '.length)
      } else {
        properties[lastProperty].value = line.substring('✓ '.length)
        lastProperty = null
      }
    }
    let maximumPropertySize = 0
    for (const property in properties) {
      if (property.length > maximumPropertySize) {
        maximumPropertySize = property.length
      }
    }
    let maximumDescriptionSize = 0
    for (const property in properties) {
      if (!properties[property].description) {
        continue
      }
      if (properties[property].description.length > maximumDescriptionSize) {
        maximumDescriptionSize = properties[property].description.length
      }
    }
    const output = []
    for (const property in properties) {
      let propertyPadding = ''
      const description = properties[property].description
      const unset = properties[property].default
      let value = properties[property].value
      if (value.indexOf(',') > -1) {
        value = value.split(',').join(', ')
      }
      while (property.length + propertyPadding.length < maximumPropertySize + 10) {
        propertyPadding += ' '
      }
      let descriptionPadding = ''
      while (description.length + descriptionPadding.length < maximumDescriptionSize + 10) {
        descriptionPadding += ' '
      }
      output.push(`${property}${propertyPadding}\t${description}${descriptionPadding}\t${unset}\t${value}`)
    }
  
    const filePath = path.join(global.applicationPath, 'env.txt')
    fs.writeFileSync(filePath, output.join('\n'))
    return output.join('\n')
  }