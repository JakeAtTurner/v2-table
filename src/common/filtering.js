/**
 * checklist/multi-select/options
 *  provides the values for the prop that will be allowed
 * 
 * Boolean
 *  true or false
 * 
 * Numeric/Dates
 *  Greater than
 *  Less than
 *  Greater
 *  Equal
 *  Lesser
 *  Between/Range
 *  
 * String
 *  Contains
 *  Includes
 *  StartsWith
 *  equals
 * 
 * filter = {
 *  field: column.prop,  // this is the field that gets filtered on.
 *  type: 'String'| 'Numeric' | 'Date' | Boolean | 'options',
 *  logic: if (type === 'String') {String options} 
 *      else if (type === 'Numeric || type === 'Date') {Numberic and Date Options}
 *  values: only for "checklist and boolean"
 *      {} if checklist
 *      true/false if boolean
 * }
 */
import {getAttribute} from './util'

const FILTER_TYPES = {
  STRING: 'string',
  NUMERIC: 'numberic',
  DATES: 'dates',
  BOOLEAN: 'boolean',
  OPTIONS: 'options'
}

const applyOptions = function (filter, data) {
  let obj = {}
  let field = filter.field
  for (let d of data) {
    let value = getAttribute(d, field)
    let list = obj[value]
    if (!list) {
      list = []
      obj[value] = list
    }
    list.push(d)
  }
  debugger
  let filteredList = []
  for (let key of Object.keys(filter.values)) {
    filteredList.push.apply(filteredList, obj[key])
  }
  return filteredList
}

 const applyFilter = function (filter, data) {
   if (filter.type === FILTER_TYPES.OPTIONS) {
     return applyOptions(filter, data)
   }
 }

 const applyFilters = function (filters, data) {
   // TODO sort the filters for the most optimal filtering options first...
   for (let f of filters) {
     data = applyFilter(f, data)
   }
   return data
 }

 export {
   applyFilters
 }
