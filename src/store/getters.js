const getters = {
  device: state => state.app.device,
  appWidth: state => state.app.width,
  appHeight: state => state.app.height,
  loadedItems: state => state.app.loadedItems
}
export default getters
