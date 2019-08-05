// ----------------------------------------------------------

var qview = null
var onCurrentViewChanged = null

function setCurrentView(view) {
    console.log("setCurrentView:", view.drawing.id)
    let old = qview
    qview = view
    if (onCurrentViewChanged != null) {
        onCurrentViewChanged(old)
    }
}

function invalidate(reserved) {
    qview.invalidateRect(reserved)
}

// ----------------------------------------------------------

function installControllersV1() {
    document.getElementById("menu").innerHTML = `
    <input type="button" id="ShapeSelector" value="Select Shape" style="visibility:hidden">
    <input type="button" id="PathCreator" value="Create Path" style="visibility:hidden">
    <input type="button" id="FreePathCreator" value="Create FreePath" style="visibility:hidden">
    <input type="button" id="LineCreator" value="Create Line" style="visibility:hidden">
    <input type="button" id="RectCreator" value="Create Rect" style="visibility:hidden">
    <input type="button" id="EllipseCreator" value="Create Ellipse" style="visibility:hidden">
    <input type="button" id="CircleCreator" value="Create Circle" style="visibility:hidden">`

    for (let gkey in qview.controllers) {
        let key = gkey
        let elem = document.getElementById(key)
        elem.style.visibility = "visible"
        elem.onclick = function() {
            if (qview.currentKey != "") {
                document.getElementById(qview.currentKey).removeAttribute("style")
            }
            elem.style.borderColor = "blue"
            elem.blur()
            qview.invokeController(key)
        }
    }
}

// ----------------------------------------------------------

function installControllersV2() {
    document.getElementById("menu").innerHTML = `
    <input type="button" id="PathCreator" value="Create Path" style="visibility:hidden">
    <input type="button" id="FreePathCreator" value="Create FreePath" style="visibility:hidden">
    <input type="button" id="LineCreator" value="Create Line" style="visibility:hidden">
    <input type="button" id="RectCreator" value="Create Rect" style="visibility:hidden">
    <input type="button" id="EllipseCreator" value="Create Ellipse" style="visibility:hidden">
    <input type="button" id="CircleCreator" value="Create Circle" style="visibility:hidden">
    <input type="button" id="ShapeSelector" value="Select Shape" style="visibility:hidden">`

    for (let gkey in qview.controllers) {
        if (gkey == "ShapeSelector") {
            continue
        }
        let key = gkey
        let elem = document.getElementById(key)
        elem.style.visibility = "visible"
        elem.onclick = function() {
            if (qview.currentKey != "ShapeSelector") {
                document.getElementById(qview.currentKey).removeAttribute("style")
            }
            elem.style.borderColor = "blue"
            elem.blur()
            qview.invokeController(key)
        }
    }
    qview.invokeController("ShapeSelector")
    qview.onControllerReset = function() {
        document.getElementById(qview.currentKey).removeAttribute("style")
        qview.invokeController("ShapeSelector")
    }
}

// ----------------------------------------------------------

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
    qview.style[key] = val
    selection_setProp(key, val)
}

function onIntPropChanged(key) {
    let elem = document.getElementById(key)
    elem.blur()
    let val = parseInt(elem.value)
    if (val > 0) {
        qview.style[key] = val
        selection_setProp(key, val)
    }
}

function onSelectionChanged(old) {
    let selection = qview.selection
    if (selection != null) {
        let style = selection.style
        qview.style = style.clone()
        document.getElementById("lineWidth").value = style.lineWidth
        document.getElementById("lineColor").value = style.lineColor
        document.getElementById("fillColor").value = style.fillColor
    }
}

function installPropSelectors() {
    qview.onSelectionChanged = onSelectionChanged
    document.getElementById("menu").insertAdjacentHTML("afterend", `<br><div id="properties">
    <label for="lineWidth">LineWidth: </label>
    <div type="BaseLineWidthPicker" id="lineWidth" onchange="onIntPropChanged('lineWidth')"></div>&nbsp;
    <label for="lineColor">LineColor: </label>
    <div type="ColorPicker" id="lineColor" onchange="onPropChanged('lineColor')" palette="black,red,blue,green,yellow,gray"></div>&nbsp;
    <label for="fillColor">FillColor: </label>
    <div type="ColorPicker" id="fillColor" onchange="onPropChanged('fillColor')" palette="white,null(transparent),black,red,blue,green,yellow,gray"></div>
    </div>`)
}

// ----------------------------------------------------------

function installMousePos() {
    document.getElementById("properties").insertAdjacentHTML("beforeend", `&nbsp;<span id="mousepos"></span>`)

    let old = qview.drawing.onmousemove
    let mousepos = document.getElementById("mousepos")
    qview.drawing.onmousemove = function(event) {
        let pos = qview.getMousePos(event)
        mousepos.innerText = "MousePos: " + pos.x + ", " + pos.y
        old(event)
    }
}

// ----------------------------------------------------------

function installAccels() {
    installControllersV2()
    installPropSelectors()
    installMousePos()
    qcontrols.init()
}

// ----------------------------------------------------------
