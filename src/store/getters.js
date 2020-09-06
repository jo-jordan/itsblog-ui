const getters = {
  device: state => state.app.device,
  appWidth: state => state.app.width,
  appHeight: state => state.app.height,
  loadedItems: state => state.app.loadedItems,
  loadItemInstances: state => state.app.loadItemInstances
}
export default getters
