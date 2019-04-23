function VisualAngle(viewer)
{
    var VisualAngle = new Object;
    VisualAngle.viewer = viewer;
    VisualAngle.GetMouseDownCoordinate = GetMouseDownCoordinate;//获取鼠标位置
    VisualAngle.KeyboardControlPerspective = KeyboardControlPerspective;//键盘控制相机位置
    VisualAngle.MouseControlCamera = MouseControlCamera;//鼠标控制相机视角
    return VisualAngle;
}
function ShieldMouseFunction()
{
     // 将鼠标的输入控制摄像机都关闭
     this.viewer.scene.screenSpaceCameraController.enableRotate = false;//旋转转换用户位置
     this.viewer.scene.screenSpaceCameraController.enableTranslate = false;//用户在地图上平移
     this.viewer.scene.screenSpaceCameraController.enableZoom = false;//控制放大缩小
     this.viewer.scene.screenSpaceCameraController.enableTilt = false;//用户倾斜相机
     this.viewer.scene.screenSpaceCameraController.enableLook = false;//
}
//键盘监听一下上下左右，将这个封装为一个方法，这个方法实现后的效果，开启这个函数后，鼠标点击的第一个位置就是你的视点，然后相机就变为那个位置
//1、鼠标点击任意位置，获得点击位置的坐标
function GetMouseDownCoordinate()
{
   
}
//用于相机视角跟随鼠标
function MouseControlCamera(isOpen)//cesiumContainer为容器id
{
    if(isOpen)
    {
        //1、如果是开启状态，鼠标消失，直接定位到相机视角
        //屏蔽掉相应的功能
        ShieldMouseFunction();
        var canvas = viewer.canvas;
        var handler = new Cesium.ScreenSpaceEventHandler(canvas);
        //用于检测鼠标是否是出现在canvas里面，然后进行后续操作
        var Oldheading = this.viewer.scene.camera.heading;
        var Oldpitch = this.viewer.scene.camera.pitch; 
        // var set = document.getElementById(cesiumContainer);

        // set.onmouseout = function ()
        // {
        //     SetOldCameraSetting();
        // }
        // function SetOldCameraSetting()
        // {
        //     Oldheading = this.viewer.scene.camera.heading;
        //     Oldpitch = this.viewer.scene.camera.pitch; 
        // }
        var timeM = null;
        handler.setInputAction(function(movement) {
            MouseControlCameradirection(movement.endPosition,Oldheading,Oldpitch,timeM);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}
function MouseControlCameradirection (mousePosition,Oldheading,Oldpitch,timeM)
{
    if(timeM!=null)
    {
        window.clearInterval(timeM); 
    }
    var width = this.viewer.canvas.clientWidth;
    var height = this.viewer.canvas.clientHeight;
    var cameraRotateType = 0;
    if(Math.abs(mousePosition.x - width) <50) //靠近canvas的右边。镜头应该往右
    {
        cameraRotateType = 1;
    }
    else if(Math.abs(mousePosition.y - height) <50)//靠近canvas的下面
    {
        cameraRotateType = 2;
    }
    else if( (mousePosition.x) <50)//靠近canvas的左边
    {
        cameraRotateType = 3;
    }
    else if ((mousePosition.y) <50)//靠近canvas的上面
    {
        cameraRotateType = 4;
    }
    else 
    {
        cameraRotateType = 5;
    }
    switch(cameraRotateType)
    {
        case 1:
        timeM= window.setInterval(canvasRight(Oldheading),10);
            break;
        case 2:
        timeM= window.setInterval(canvasLeft(Oldheading),10);
            break;
        case 3:
        timeM= window.setInterval(canvasUp(Oldpitch),10);
            break;
        case 4:
        timeM=window.setInterval(canvasDown(Oldpitch),10);
            break;
        case 5:
            functionMainForCamera(mousePosition,Oldheading,Oldpitch);
            break;
        default :
            break;
    }
    
 }
function canvasRight(Oldheading)
{
    Oldheading = Oldheading + 0.01;
    this.viewer.scene.camera.setView({
        orientation: {
            heading :Oldheading ,//由北向东旋转的角度,目前是正北 偏航角
        }
       });
}
function canvasLeft(Oldheading)
{
    Oldheading = Oldheading - 0.01;
    this.viewer.scene.camera.setView({
        orientation: {
            heading :Oldheading ,//由北向东旋转的角度,目前是正北 偏航角
        }
       });
}
function canvasUp(Oldpitch)
{
    Oldpitch = Oldpitch - 0.01;
    this.viewer.scene.camera.setView({
        orientation: {
            pitch : Oldpitch,//方向和水平平面的夹角   俯仰角
        }
       });
}
function canvasDown(Oldpitch)
{
    Oldpitch = Oldpitch + 0.01;
    this.viewer.scene.camera.setView({
        orientation: {
            pitch : Oldpitch,//方向和水平平面的夹角   俯仰角
        }
       });
}
function functionMainForCamera(mousePosition,Oldheading,Oldpitch)
{
    var width = this.viewer.canvas.clientWidth;
    var height = this.viewer.canvas.clientHeight;
    var cameraPostionOnScreen = new Cesium.Cartesian2(width/2, height/2);
    var assumeDistance = 1000;
    var headingAngle;////偏航角
    var pitchAngle;//俯仰角    
    var x = mousePosition.x - cameraPostionOnScreen.x;
    var sinx = x/assumeDistance;
    headingAngle = Math.asin(sinx);
    var y = mousePosition.y - cameraPostionOnScreen.y;
    var siny = y/assumeDistance; 
    pitchAngle = Math.asin(siny);
    //获取到相机投影到屏幕的坐标
    if(Oldpitch * (180/Math.PI)<80 && Oldpitch * (180/Math.PI)>-80)
    {
        this.viewer.scene.camera.setView({
            orientation: {
                heading :Oldheading + headingAngle,//由北向东旋转的角度,目前是正北 偏航角
                pitch : Oldpitch-pitchAngle,//方向和水平平面的夹角   俯仰角
                roll : 0//正东方向为轴的旋转角度   翻滚角
            }
           });
    }
    else
    {
        this.viewer.scene.camera.setView({
            orientation: {
                heading :Oldheading + headingAngle,//由北向东旋转的角度,目前是正北 偏航角
                pitch : -(70/(180/Math.PI))-pitchAngle,//方向和水平平面的夹角   俯仰角
                roll : 0//正东方向为轴的旋转角度   翻滚角
            }
           });
    }
}
//此方法仅限于在键盘控制位移
function KeyboardControlPerspective()
{
    var scene = viewer.scene;
    var canvas = viewer.canvas;
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function() {
    canvas.focus();
    };
    var ellipsoid = scene.globe.ellipsoid;
    ShieldMouseFunction();
    var flags = {
        moveForward : false,
        moveBackward : false,
        moveUp : false,
        moveDown : false,
        moveLeft : false,
        moveRight : false
    };
    //如此看来，还需要设置一个，相机的视角跟随这鼠标移动
    function getFlagForKeyCode(keyCode) {
        switch (keyCode) {
            case 'W'.charCodeAt(0):
            return 'moveForward';//前移
        case 'S'.charCodeAt(0):
            return 'moveBackward';//后退
        case 'Q'.charCodeAt(0):
            return 'moveUp';//上移
        case 'E'.charCodeAt(0):
            return 'moveDown';//下移
        case 'D'.charCodeAt(0):
            return 'moveRight';//右移
        case 'A'.charCodeAt(0):
            return 'moveLeft';//左移
        default:
            return undefined;
        }
    }
    document.addEventListener('keydown', function(e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = true;
        }
    }, false);
    document.addEventListener('keyup', function(e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = false;
        }
    }, false);
    viewer.clock.onTick.addEventListener(function(clock) {
            var camera = viewer.camera;
            var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
            var moveRate = cameraHeight / 100.0;

            if (flags.moveForward) {
             camera.moveForward(moveRate);
            }
            if (flags.moveBackward) {
                camera.moveBackward(moveRate);
            }
            if (flags.moveUp) {
                camera.moveUp(moveRate);
            }
            if (flags.moveDown) {
                camera.moveDown(moveRate);
            }
            if (flags.moveLeft) {
                camera.moveLeft(moveRate);
            }
            if (flags.moveRight) {
                camera.moveRight(moveRate);
            }
        });
}