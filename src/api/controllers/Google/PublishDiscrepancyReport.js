const moment = require('moment')
const Sheets = require('./Sheets')
const Report = require('../Report/')

const filename = 'Discrepancy-Report-2018-07-11'
const sheetTitle = moment().format('HH:mm:ss')

const asList = [
  'lkqd',
  'streamrail',
  'springserve',
  'aniview'
]

const styles = ({
  type,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex
}) => {
  switch (type) {
    case 'total':
      return {
        repeatCell: {
          range: {
            sheetId: '__sheetId__',
            startColumnIndex,
            endColumnIndex,
            startRowIndex,
            endRowIndex
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true
              }
            }
          },
          fields: 'userEnteredFormat(textFormat)'
        }
      }
    case 'centered':
      return {
        repeatCell: {
          range: {
            sheetId: '__sheetId__',
            startColumnIndex,
            endColumnIndex,
            startRowIndex,
            endRowIndex
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat(horizontalAlignment)'
        }
      }
    case 'usd':
      return {
        repeatCell: {
          range: {
            sheetId: '__sheetId__',
            startColumnIndex,
            endColumnIndex,
            startRowIndex,
            endRowIndex
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: 'NUMBER',
                pattern: '$0.0'
              }
            }
          },
          fields: 'userEnteredFormat(numberFormat)'
        }
      }
    case 'percentage':
      return {
        repeatCell: {
          range: {
            sheetId: '__sheetId__',
            startColumnIndex,
            endColumnIndex,
            startRowIndex,
            endRowIndex
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: 'NUMBER',
                pattern: '0%'
              }
            }
          },
          fields: 'userEnteredFormat(numberFormat)'
        }
      }
    case 'conditionalColorPositive':
      return {
        addConditionalFormatRule: {
          rule: {
            ranges: [{
              sheetId: '__sheetId__',
              startColumnIndex,
              endColumnIndex,
              startRowIndex,
              endRowIndex
            }],
            booleanRule: {
              condition: {
                type: 'NUMBER_GREATER',
                values: [
                  {
                    userEnteredValue: '0'
                  }
                ]
              },
              format: {
                backgroundColor: {
                  blue: 0.9,
                  green: 1,
                  red: 0.9
                }
              }
            }
          },
          index: 0
        }
      }
    case 'conditionalColorNutral':
      return {
        addConditionalFormatRule: {
          rule: {
            ranges: [{
              sheetId: '__sheetId__',
              startColumnIndex,
              endColumnIndex,
              startRowIndex,
              endRowIndex
            }],
            booleanRule: {
              condition: {
                type: 'NUMBER_EQ',
                values: [
                  {
                    userEnteredValue: '0'
                  }
                ]
              },
              format: {
                textFormat: {
                  foregroundColor: {
                    blue: 0.75,
                    green: 0.75,
                    red: 0.75
                  },
                  italic: true
                }
              }
            }
          },
          index: 0
        }
      }
    case 'conditionalColorNegative':
      return {
        addConditionalFormatRule: {
          rule: {
            ranges: [{
              sheetId: '__sheetId__',
              startColumnIndex,
              endColumnIndex,
              startRowIndex,
              endRowIndex
            }],
            booleanRule: {
              condition: {
                type: 'NUMBER_LESS',
                values: [
                  {
                    userEnteredValue: '0'
                  }
                ]
              },
              format: {
                backgroundColor: {
                  blue: 0.9,
                  green: 0.9,
                  red: 1
                }
              }
            }
          },
          index: 0
        }
      }
    default:
      return {}
  }
}

const formatData = [
  {
    ...styles({
      type: 'centered',
      startColumnIndex: 0,
      endColumnIndex: (asList.length + 1) * 2 + 1,
      startRowIndex: 0,
      endRowIndex: 2
    })
  }, {
    ...styles({
      type: 'total',
      startColumnIndex: 0,
      endColumnIndex: (asList.length + 1) * 2 + 1,
      startRowIndex: 2,
      endRowIndex: 3
    })
  }
]
for (let i = 0; i < asList.length + 1; i++) {
  formatData.push({
    mergeCells: {
      range: {
        sheetId: '__sheetId__',
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: (i * 2) + 1,
        endColumnIndex: (i * 2) + 3
      },
      mergeType: 'MERGE_ALL'
    }
  })
  formatData.push({
    ...styles({
      type: 'percentage',
      startColumnIndex: (i * 2) + 1,
      endColumnIndex: (i * 2) + 2,
      startRowIndex: 2
    })
  })
  formatData.push({
    ...styles({
      type: 'usd',
      startColumnIndex: (i * 2) + 2,
      endColumnIndex: (i * 2) + 3,
      startRowIndex: 2
    })
  })
}

const addHeader = data => {
  const firstRow = ['']
  const secondRow = ['']
  for (let as of asList) {
    firstRow.push(as)
    firstRow.push('')
    secondRow.push('%')
    secondRow.push('$')
  }
  firstRow.push('Total')
  firstRow.push('')
  secondRow.push('%')
  secondRow.push('$')
  data.push(firstRow)
  data.push(secondRow)
}

const addTotalRow = (data, report) => {
  const totalRow = ['Total']
  let totalTotalAsRev = 0
  let totalTotalSspRev = 0
  for (let i in asList) {
    const as = asList[i]
    let totalAsRev = 0
    let totalSspRev = 0
    for (let ssp of report.bySsp) {
      totalSspRev += ssp[as].revenue
      totalAsRev += ssp[as].asRevenue
      totalTotalSspRev += ssp[as].revenue
      totalTotalAsRev += ssp[as].asRevenue
    }
    // Add total cells for this AS
    const totalDiff = totalSspRev - totalAsRev
    const totalDiffPercent = totalAsRev === 0 ? 0 : totalSspRev / totalAsRev - 1
    totalRow.push(totalDiffPercent)
    totalRow.push(totalDiff)
  }
  // Add total cells for all ASs
  const totalTotalDiff = totalTotalSspRev - totalTotalAsRev
  const totalTotalDiffPercent = totalTotalAsRev === 0 ? 0 : totalTotalSspRev / totalTotalAsRev - 1
  totalRow.push(totalTotalDiffPercent)
  totalRow.push(totalTotalDiff)
  data.push(totalRow)
}

const addAsRows = (data, report) => {
  for (let ssp of report.bySsp) {
    const row = [ssp.ssp]
    let totalSspRev = 0
    let totalAsRev = 0
    for (let as of asList) {
      const sspRevenue = ssp[as].revenue
      const asRevenue = ssp[as].asRevenue
      const diff = sspRevenue - asRevenue
      const diffPercent = asRevenue === 0 ? 0 : sspRevenue / asRevenue - 1
      row.push(diffPercent)
      row.push(diff)
      totalSspRev += sspRevenue
      totalAsRev += asRevenue
    }
    const totalDiff = totalSspRev - totalAsRev
    const totalDiffPercent = totalAsRev === 0 ? 0 : totalSspRev / totalAsRev - 1
    row.push(totalDiffPercent)
    row.push(totalDiff)
    data.push(row)
  }
}

const addCellFormat = (data, formatData) => {
  formatData.push({
    ...styles({
      type: 'conditionalColorPositive',
      startColumnIndex: 1,
      endColumnIndex: data[0].length + 1,
      startRowIndex: 2,
      endRowIndex: data.length
    })
  })
  formatData.push({
    ...styles({
      type: 'conditionalColorNutral',
      startColumnIndex: 1,
      endColumnIndex: data[0].length + 1,
      startRowIndex: 2,
      endRowIndex: data.length
    })
  })
  formatData.push({
    ...styles({
      type: 'conditionalColorNegative',
      startColumnIndex: 1,
      endColumnIndex: data[0].length + 1,
      startRowIndex: 2,
      endRowIndex: data.length
    })
  })
}

const createSheetData = report => {
  // console.log(report.bySsp)
  const data = []
  addHeader(data)
  addTotalRow(data, report)
  addAsRows(data, report)
  addCellFormat(data, formatData)
  return {
    data,
    formatData
  }
}

const main = async ({ from, to }) => {
  const report = await Report.default.groupBySspAs(from, to)
  const { data, formatData } = createSheetData(report)
  await Sheets.publishReport({ filename, sheetTitle, data, formatData })
}

export default main
