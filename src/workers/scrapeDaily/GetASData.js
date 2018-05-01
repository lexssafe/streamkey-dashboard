import _ from 'lodash'
import winston from 'winston'

import GetTagBase from './GetTagBase'
import MergeAsResults from './MergeAsResults'

// import StreamRail from './AS/StreamRail'
import Lkqd from './AS/Lkqd'
// import Aniview from './AS/Aniview'
// import SpringServe from './AS/SpringServe'

const AdServers = [
  {
  //   key: 'streamrail',
  //   controller: StreamRail
  // }, {
    key: 'lkqd',
    controller: Lkqd
  // }, {
  //   key: 'aniview',
  //   controller: Aniview
  // }, {
  //   key: 'springserve',
  //   controller: SpringServe
  }
]

const groupAsResults = (asResults, asKey) => {
  const groups = {
    mnl: {},
    auton_wl: {},
    auton_for: {},
    ron: {}
  }
  _.each(asResults, r => {
    try {
      const tagBase = GetTagBase(r.tag)
      let group
      if (r.tag.startsWith('MNL_')) {
        group = groups.mnl
      } else if (r.tag.startsWith('AUTON_') && r.tag.endsWith('_WL')) {
        group = groups.auton_wl
      } else if (r.tag.startsWith('AUTON_') && r.tag.indexOf('_FOR_') > -1) {
        group = groups.auton_for
      } else if (r.tag.endsWith('_RON')) {
        group = groups.ron
      } else {
        winston.warn('Tag Error', { tag: r.tag })
        return
      }
      group[tagBase] = MergeAsResults(group[tagBase], r)
    } catch (e) {
      winston.error('AS Group Error', {
        error: e.message,
        asKey,
        asResult: r
      })
    }
  })
  return groups
}

const validateDataStructure = data => {
  _.each(data, d => {
    if (
      !_.isString(d.tag) ||
      !_.isInteger(d.asOpp) ||
      !_.isInteger(d.asImp) ||
      !_.isNumber(d.asRev) ||
      !_.isNumber(d.asCost) ||
      !_.isNumber(d.asScost)
    ) {
      winston.error('Invalid AS Result', { result: d })
    }
  })
}

export default async dateTs => {
  const results = []

  const fetchJobs = AdServers.map(async item => {
    try {
      winston.info('AS Start', { as: item.key })
      const data = await item.controller.getData(dateTs)
      validateDataStructure(data)
      winston.info('AS Finish', { as: item.key })
      winston.verbose('AS Results', {
        key: item.key,
        data
      })
      results.push({
        key: item.key,
        data: groupAsResults(data, item.key)
      })
    } catch (e) {
      winston.error('AS getData Error', {
        error: e.message,
        item
      })
    }
  })
  await Promise.all(fetchJobs)

  return results
}
