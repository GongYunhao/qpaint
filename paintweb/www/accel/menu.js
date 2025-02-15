// ----------------------------------------------------------

function unselectElementById(id) {
    if (id != "ShapeSelector") {
        document.getElementById(id).removeAttribute("style")
    }
}

var _views = []

function onClickCtrl(key) {
    unselectElementById(qview.currentKey)
    let elem = document.getElementById(key)
    elem.style.borderColor = "blue"
    elem.blur()
    for (i in _views) {
        _views[i].invokeController(key)
    }
}

/**
 * 加载控制器按钮
 *
 */
function installControllers() {
    document.getElementById("menu").innerHTML = `
    <input type="button" id="PathCreator" value="Create Path" onclick="onClickCtrl('PathCreator')">
    <input type="button" id="FreePathCreator" value="Create FreePath" onclick="onClickCtrl('FreePathCreator')">
    <input type="button" id="LineCreator" value="Create Line" onclick="onClickCtrl('LineCreator')">
    <input type="button" id="RectCreator" value="Create Rect" onclick="onClickCtrl('RectCreator')">
    <input type="button" id="EllipseCreator" value="Create Ellipse" onclick="onClickCtrl('EllipseCreator')">
    <input type="button" id="CircleCreator" value="Create Circle" onclick="onClickCtrl('CircleCreator')">`

    // 注册视图加载时需要调用的函数
    onViewAdded(function (view) {
        // 激活图形选择控制器(可以在界面上拖动图形)
        view.invokeController("ShapeSelector")

        // 注册控制器重置事件:当重置时,取消图形的选中状态,并且激活选择控制器
        // 本质上是消除状态,将界面重置到刚加载的样子
        view.onControllerReset = function() {
            unselectElementById(view.currentKey)
            view.invokeController("ShapeSelector")
        }
        _views.push(view)
    })
}

// ----------------------------------------------------------

var defaultStyle = new QShapeStyle(1, "black", "white")

function selection_setProp(key, val) {
    if (qview.selection != null) {
        qview.selection.setProp(qview.doc, key, val)
        invalidate(null)
    }
}

function onPropChanged(key) {
    let elem = document.getElementById(key)
    let val = elem.value
    elem.blur()
    defaultStyle[key] = val
    selection_setProp(key, val)
}

function onIntPropChanged(key) {
    let elem = document.getElementById(key)
    elem.blur()
    let val = parseInt(elem.value)
    if (val > 0) {
        defaultStyle[key] = val
        selection_setProp(key, val)
    }
}

function onSelectionChanged(old) {
    let selection = qview.selection
    if (selection != null) {
        let style = selection.style
        defaultStyle = style.clone()
        document.getElementById("lineWidth").value = style.lineWidth
        document.getElementById("lineColor").value = style.lineColor
        document.getElementById("fillColor").value = style.fillColor
    }
}

/**
 * 加载属性选择器
 */
function installPropSelectors() {
    document.getElementById("menu").insertAdjacentHTML("afterend", `<br><div id="properties">
    <label for="lineWidth">LineWidth: </label>
    <div type="BaseLineWidthPicker" id="lineWidth" onchange="onIntPropChanged('lineWidth')"></div>&nbsp;
    <label for="lineColor">LineColor: </label>
    <div type="ColorPicker" id="lineColor" onchange="onPropChanged('lineColor')" palette="black,red,blue,green,yellow,gray"></div>&nbsp;
    <label for="fillColor">FillColor: </label>
    <div type="ColorPicker" id="fillColor" onchange="onPropChanged('fillColor')" palette="white,null(transparent),black,red,blue,green,yellow,gray"></div>
    </div>`)
    onViewAdded(function(view) {
        view.onSelectionChanged = function(old) {
            if (qview === view) {
                onSelectionChanged(old)
            }
        }
    })
}

// ----------------------------------------------------------

function installMousePos() {
    document.getElementById("properties").insertAdjacentHTML("beforeend", `&nbsp;<span id="mousepos"></span>`)

    let mousepos = document.getElementById("mousepos")
    onViewAdded(function(view) {
        let old = view.drawing.onmousemove
        view.drawing.onmousemove = function(event) {
            let pos = view.getMousePos(event)
            mousepos.innerText = "MousePos: " + pos.x + ", " + pos.y
            old(event)
        }
    })
}

// ----------------------------------------------------------

installControllers()
installPropSelectors()
installMousePos()

// ----------------------------------------------------------
