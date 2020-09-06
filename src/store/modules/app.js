const state = {
  device: 'desktop',
  width: 0,
  height: 0,
  loadedItems: {
    finder: false,
    email: false,
    archieve: false,
    address: false
  },
  loadItemInstances: {
    finder: null,
    email: null,
    archieve: null,
    address: null
  }
}

const mutations = {
  LOAD_ITEM: (state, { itemName, instance }) => {
    state.loadedItems[itemName] = true
    state.loadItemInstances[itemName] = instance
    
  },
  UNLOAD_ITEM: (state, itemName) => {
    state.loadedItems[itemName] = false
    var instance = state.loadItemInstances[itemName]
    let target = instance.$el
    target.parentNode.removeChild(target)
    state.loadItemInstances[itemName] = null
  },
  SET_WIDTH: (state, width) => {
    state.width = width
  },
  SET_HEIGHT: (state, height) => {
    state.height = height
  },
}

const actions = {
  loadItem({ commit }, { itemName, instance }) {
    commit('LOAD_ITEM', { itemName, instance })
  },
  unloadItem({ commit }, {itemName}) {
    commit('UNLOAD_ITEM', itemName)
  },
  setWidth({ commit }, {width}) {
    commit('SET_WIDTH', width)
  },
  setHeight({ commit }, {height}) {
    commit('SET_HEIGHT', height)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
