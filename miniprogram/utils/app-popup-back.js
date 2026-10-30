// uni-popup 的显示状态用于区分实际打开的弹窗和尚未渲染的 ref。
function closeTopPopup(root) {
	var match = null
	function visit(owner) {
		var children = owner.$children || []
		children.forEach(function (child) {
			if (child.$options && child.$options.name === 'uniPopup' && child.showTrans && child.type !== 'message') {
				match = {popup: child, owner: owner}
			}
			visit(child)
		})
	}
	visit(root)
	if (!match) return false
	var owner = match.owner
	// 优先执行表单自身关闭方法，重置选择并通知父组件。
	if (owner.$refs && owner.$refs.popup === match.popup && typeof owner.handleClose === 'function') {
		owner.handleClose()
	} else if (owner.$refs && owner.$refs.popup === match.popup && typeof owner.close === 'function') {
		owner.close()
	} else {
		match.popup.close()
	}
	return true
}

module.exports = {closeTopPopup: closeTopPopup}
