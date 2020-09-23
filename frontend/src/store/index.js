'use strict'

import Vue from 'vue'
import Vuex from 'vuex'
import geoHash from '@/helpers/geoHash'

Vue.use(Vuex)
const GEOHASH_LENGTH = 5

// initial state
const state = {
  initialized: false,
  position: {
    latitude: '-70.8238872',
    longitude: '43.0385959'
  },
  hashKey: '',
  user: {},
  seeks: []
}

// getters
const getters = {
  isInitialized: (state) => state.initialized,
  getPosition: (state) => state.position,
  getUser: (state) => state.user,
  getSeeks: (state) => state.seeks,
  getHashKey: (state) => state.hashKey
}

//mutations
const mutations = {
  setPosition(state, position) {
    state.position.latitude = position.coords.latitude
    state.position.longitude = position.coords.longitude;  
    const hash = geoHash.getGeoHashCell(
      position.coords.latitude,
      position.coords.longitude,
      GEOHASH_LENGTH
    )
    state.hashKey = hash
  },
  saveSeek(state, seek) {

    console.log('store::saveSeek:', seek)
    for (let i in state.seeks) {
      console.log(state.seeks[i])
      if (state.seeks[i].rangeKey === seek.rangeKey) {
        console.log('Matched: ', seek.rangeKey)
        state.seeks[i].answers = seek.answers
        state.seeks[i].avgScore = seek.avgScore
        return
      }
    }    
    console.log('Not in store - adding')

    state.seeks.push(seek)

  },
  setUser(state, user) {
    state.user = user
  },
  setHashKey(state, hashKey) {
    state.hashKey = hashKey
  },  
  setInitialized(state, val) {
    console.log('setInitalized')
    state.initialized = val
  },
  setAllSeeks(state, seeks) {
    state.seeks = seeks
  },
  updateSeek(state, seek) {
    console.log('store::updateSeek')
    for (let i in state.seeks) {
      if (state.seeks[i].rangeKey === seek.rangeKey) {
        state.seeks[i].answers = seek.answers
        state.seeks[i].avgScore = seek.avgScore
        console.log('Updated seek: ', state.seeks[i].rangeKey)
      }
    }
  }
}

export default new Vuex.Store({
  // strict: true,
  state,
  getters,
  mutations
})
