import moment from 'moment'
import qs from 'querystring'

import GenerateAxiosCookies from '../GenerateAxiosCookies'

const axios = GenerateAxiosCookies()

const credentials = {
  username: process.env.RAZZLE_CREDENTIALS_BEACHFRONT_USERNAME,
  password: process.env.RAZZLE_CREDENTIALS_BEACHFRONT_PASSWORD
}

axios.defaults.baseURL = 'https://platform.beachfront.io'

const login = async () => {
  const form = {
    username: credentials.username,
    password: credentials.password,
    remember_me: 'on'
  }
  try {
    await axios.post('/en/login', qs.stringify(form))
  } catch (e) {
    e.prevError = e.message
    e.message = 'Beachfront login failed'
    throw e
  }
}

const getResults = async dateTs => {
  const date = moment.utc(dateTs, 'X').format('M/D/YYYY')
  const form = {
    start_date: date,
    end_date: date,
    // date_range: 'yesterday',
    search: '',
    view: 'ALL',
    selected_filter: 0,
    compare_previous: 0
  }
  try {
    const res = await axios.post('/restful/users/dashboard/inventory/stats', qs.stringify(form))
    return res.data.data.grid.data
  } catch (e) {
    e.prevError = e.message
    e.message = 'Beachfront report failed'
    throw e
  }
}

const normalize = results => {
  return results.map(r => {
    return {
      tag: r.title,
      opp: r.requests,
      imp: r.impressions,
      rev: r.revenue,
      sCost: (r.requests - r.impressions) * 0.0000015
    }
  })
}

export default {
  getData: async dateTs => {
    await login()
    const results = await getResults(dateTs)
    return normalize(results)
  }
}
