// ----------------------------------------------------------

var qview = null
var _onCurrentViewChangeds = []

function onCurrentViewChanged(handle) {
    _onCurrentViewChangeds.push(handle)
}

function setCurrentView(view) {
    let old = qview
    qview = view
    for (let i in _onCurrentViewChangeds) {
        let handle = _onCurrentViewChangeds[i]
        handle(old)
    }
}

function invalidate(reserved) {
    qview.invalidateRect(reserved)
}

// ----------------------------------------------------------

var _onViewAddeds = []

/**
 * 注册视图加载时需要处理的函数
 *
 * @param {*} handle 待注册函数
 */
function onViewAdded(handle) {
    _onViewAddeds.push(handle)
}

/**
 * 建立新视图时调用
 * 将注册过的处理函数全部调用一遍
 *
 * @param {*} view 视图
 */
function fireViewAdded(view) {
    for (let i in _onViewAddeds) {
        let handle = _onViewAddeds[i]
        handle(view)
    }
}

// ----------------------------------------------------------

/**
 * ViewModel核心
 * 在 MVC 里面是承上启下的桥梁作用
 * 由于我们把实际绘制（onpaint）的工作交给 Model 层, View 基本上就只是胶水层了
 * View层,或者说ViewModel层的主要作用
 * 一是屏蔽了平台差异,其他层主要依赖View发布的事件,除了model层需要处理绘图方面的差异以外,不需要太大改动
 * 定义界面布局,在不同尺寸的设备上实现功能
 *
 * @class QPaintView
 */
class QPaintView {
    constructor(drawingID) {
        this.controllers = {}
        this._currentKey = ""
        this._current = null
        this._selection = null
        this.onmousedown = null
        this.onmousemove = null
        this.onmouseup = null
        this.ondblclick = null
        this.onkeydown = null
        this.onSelectionChanged = null
        this.onControllerReset = null
        let drawing = document.getElementById(drawingID)
        let view = this
        drawing.onmousedown = function (event) {
            event.preventDefault()
            if (view.onmousedown != null) {
                view.onmousedown(event)
            }
        }
        drawing.onmousemove = function (event) {
            if (view.onmousemove != null) {
                view.onmousemove(event)
            }
        }
        drawing.onmouseup = function (event) {
            if (view.onmouseup != null) {
                view.onmouseup(event)
            }
        }
        drawing.ondblclick = function (event) {
            event.preventDefault()
            if (view.ondblclick != null) {
                view.ondblclick(event)
            }
        }
        drawing.onmouseenter = function (event) {
            setCurrentView(view)
        }
        document.onkeydown = function (event) {
            switch (event.keyCode) {
                case 9: case 13: case 27:
                    event.preventDefault()
            }
            if (view.onkeydown != null) {
                view.onkeydown(event)
            }
        }
        window_onhashchange(function (event) {
            view.doc.reload()
            view.invalidateRect(null)
        })
        this.drawing = drawing
        this.doc = new QPaintDoc()/*建立model层的根节点*/
        this.doc.onload = function () {
            view.invalidateRect(null)
        }
        this.doc.init()
    }

    get currentKey() {
        return this._currentKey
    }
    get selection() {
        return this._selection
    }
    set selection(shape) {
        let old = this._selection
        if (old != shape) {
            this._selection = shape
            if (this.onSelectionChanged != null) {
                this.onSelectionChanged(old)
            }
        }
    }

    getMousePos(event) {
        return {
            x: event.offsetX,
            y: event.offsetY
        }
    }

    /**
     * ViewModel的重绘方法
     *
     * @param {*} ctx canvas绘图上下文
     * @memberof QPaintView
     */
    onpaint(ctx) {
        this.doc.onpaint(ctx)
        if (this._current != null) {
            this._current.onpaint(ctx)
        }
    }

    invalidateRect(reserved) {
        let ctx = this.drawing.getContext("2d")
        let bound = this.drawing.getBoundingClientRect()
        ctx.clearRect(0, 0, bound.width, bound.height)
        this.onpaint(ctx)
    }
    // #region 注册,激活,停止controller
    registerController(name, controller) {
        if (name in this.controllers) {
            alert("Controller exists: " + name)
        } else {
            this.controllers[name] = controller
        }
    }
    invokeController(name) {
        this.stopController()
        if (name in this.controllers) {
            let controller = this.controllers[name]
            this._setCurrent(name, controller())
        }
    }
    stopController() {
        if (this._current != null) {
            this._current.stop()
            this._setCurrent("", null)
        }
    }
    /**
     * 重置界面,恢复到初始状态
     *
     * @memberof QPaintView
     */
    fireControllerReset() {
        // 调用已注册的函数
        if (this.onControllerReset != null) {
            this.onControllerReset()
        }
    }
    // #endregion
    _setCurrent(name, ctrl) {
        this._current = ctrl
        this._currentKey = name
    }
}

// ----------------------------------------------------------
