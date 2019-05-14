//此时展示用的基本功能已经完成，然后进一步功能就是选择一个点，然后


//太阳光源无需进行设置，只需要显示出来即可，模拟触发时间线控件来实现太阳的转移，加上阴影即可。写的时候参考supermap的文档
//但是应该是可以设置点光源的，没有是不合理的，太阳光本身是自带的，我们只需要自带的就可以实现
//首相第一个方法就是判断太阳光是否是打开的，如果不是打开的话，无法进行日照分析
//定义一个枚举类型，用于设置时间轴的方式，
var timeType = 
{
    NowTime :1,//将时间定为现在的时间
    TimeFullFlow:2,//从白天到晚上
    TimeFlowNowToEnd:5,//时间从现在到晚上都是默认为600
    TimeFlowGoOrPause:3,//动画的的暂停和开始
    TimeFlowOpenorClose:4,//动画的开启和关闭
}
function SunPosition()
{
    this.SolarAltitudeAngle;
    this.SolarAzimuth;
}
function SunshineAnalysis(viewer)
{
    //将Cesium找到然后进行一系列操作
    var SunshineAnalysis = new Object;
    SunshineAnalysis.viewer = viewer;
    SunshineAnalysis.PointSunshineAnalysis = PointSunshineAnalysis;//点的日照分析
    SunshineAnalysis.IsSunLightOpen = IsSunLightOpen;//注册一下IsSunLightOpen方法
    SunshineAnalysis.SetTimeFlow = SetTimeFlow;//时间固有方法
    SunshineAnalysis.TimeFlowAnyTime = TimeFlowAnyTime;//这是自己设置任意时间，任意时间速率的方法
    SunshineAnalysis.OpenShadows = OpenShadows;//打开阴影
    SunshineAnalysis.CloseShadows = CloseShadows;//关闭阴影
    SunshineAnalysis.OpenSun = OpenSun;//打开太阳
    SunshineAnalysis.CloseSun = CloseSun;//关闭太阳
    SunshineAnalysis.OpenSunshine = OpenSunshine;//打开日光
    SunshineAnalysis.OpenSunshine = CloseSunshine;//关闭日光
    
    return SunshineAnalysis;//返回SunshineAnalysis对象
}
//第一个是要分析的点的位置（是世界坐标）
//date（日期），经纬度，startTime是开始时间，endTime是结束时间，这里经纬度不传值的话默认是前面的要日照分析的点。,date,startTime,endTime
function PointSunshineAnalysis(postion,wuti)//可以是二维的鼠标点，也可以是三维的直接坐标
{
    this.viewer.entities.remove( this.viewer.entities.getById("1"));
    this.viewer.entities.remove( this.viewer.entities.getById("point"));
    //第一步，获取要分析的点位置
    if(postion != null)
    {
        if(postion.constructor.name != "Cartesian3")
        {
            throw "传入参数必须是三维坐标";
        }
    }
    else{
        throw "无效参数";
    }
    //第二步，获取太阳的世界坐标,这里获取太阳的坐标的做法是很傻的，现在做一个函数，根据日期，时间，来推算出太阳高度角和太阳俯视角
    console.log(postion.x+"  "+postion.y);
    if(!this.viewer.scene.sun.show)
    {
        SunshineAnalysis.OpenSun();
    }
    //1、获取太阳位置的方法
    //var sunPostion = Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(date);地球为中心的坐标系下的太阳位置

    var sunposition2 =  this.viewer.scene.context.uniformState.sunPositionWC;//这个应该是贴图的位置，
    console.log(sunposition2.x+"  "+sunposition2.y);
    var fx = new Cesium.Cartesian3(sunposition2.x-postion.x,sunposition2.y-postion.y,sunposition2.z-postion.z);
    var dec = Math.sqrt(fx.x * fx.x +fx.y * fx.y+fx.z * fx.z);
    var fxxl = new Cesium.Cartesian3(fx.x/dec,fx.y/dec,fx.z/dec);//方向向量
    var changdu = 200;
    var zd = new Cesium.Cartesian3(postion.x + changdu*fxxl.x,postion.y + changdu*fxxl.y,postion.z + changdu*fxxl.z);
    //第三步，做射线，
    var arrowPositions = [
        postion,
        zd
    ];
    var arrow = this.viewer.entities.add({
        id:"1",
        polyline : {
            positions : arrowPositions,
            width : 10, 
            followSurface : false,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE)
        }
    });
    //第四步，一天进行日照分析，如果线之间被隔断，就认为该点被阻挡了
    //console.log(wuti.id);
    jiance(postion,zd,wuti);
    //pickFromRay(postion,sunposition2);
}
function jiance(start,end)
{
    var num = 100;
    var isshowders = false;
    var rad1 = Cesium.Cartographic.fromCartesian(start);
    var rad2 = Cesium.Cartographic.fromCartesian(end);//开始节点和结束节点转换为以弧度计算的经纬度
    var points = [];
    //这里表示插值函数，start和end是起始点，然后进行插值，检测高程，如果获取的地面点比差值点的高程高的话就代表有焦点
    //坐标转经纬度
    let startpoint =  {};
    startpoint.longitude = rad1.longitude / Math.PI * 180;
    startpoint.latitude = rad1.latitude / Math.PI * 180;
    startpoint.czheight = rad1.height;//将开始节点转换为角度的点
    let endpoint = {};
    endpoint.longitude = rad2.longitude / Math.PI * 180;
    endpoint.latitude = rad2.latitude / Math.PI * 180;
    endpoint.czheight = rad2.height;//将结束节点节点转换为角度的点
    for(var i=0;i<num;i++)
    {
        let point = {};
        point.longitude = Cesium.Math.lerp(startpoint.longitude,endpoint.longitude,0.01*(i+1));
        point.latitude = Cesium.Math.lerp(startpoint.latitude,endpoint.latitude,0.01*(i+1));
        point.czheight = startpoint.czheight-(startpoint.czheight-endpoint.czheight)*0.01*(i+1);
        var terCartographic = new Cesium.Cartographic(Cesium.Math.toRadians(point.longitude),Cesium.Math.toRadians(point.latitude) ,0);//转经纬度对像
        var cartographichight = this.viewer.scene.sampleHeight(terCartographic);//坐标点获取建筑物高程
        var cartographic = Cesium.Cartesian3.fromDegrees( point.longitude, point.latitude, cartographichight) ;//经纬度转世界坐标
          this.viewer.entities.add({
            position:cartographic,
            point:{
                pixelSize: 4,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2
            }
        });
        point.zsheight = cartographichight;//真实点的高程
        if(point.zsheight>point.czheight)
        {
            isshowders = true;
        }
        points.push(point);
    }
    if(isshowders)  console.log("在阴影中");
    else  console.log("不在阴影中");
    console.log(points);
}
//这里的starttime是Cesium的时间并非Date的时间,和时间变化速率
function TimeFlowAnyTime(startTime,EndTime,multiplier)
{
    clockViewModel.startTime  =  new Cesium.JulianDate.fromDate(startTime);
    clockViewModel.stopTime = new Cesium.JulianDate.fromDate(EndTime);
    //开始动画
    clockViewModel.canAnimate = true;
    clockViewModel.shouldAnimate = true;
    clockViewModel.multiplier = multiplier;
}
function SetTimeFlow(timeType)
{
    switch(timeType)
    {
        case  1:
            SetTimeNow();//设置场景为当前时间
            break;
        case 2:
            var startTime = new Date();
            startTime.setHours(0);
            startTime.setMinutes(0);
            startTime.setSeconds(0);//将今天的凌晨的日期获取到
            SetTimeFullFlowOrNowToEnd(startTime);//默认加速600倍，并且是从当天凌晨到第二天凌晨
            break;
        case 3:
            TimeFlowGoOrPause();//设置动画的暂停与启动
            break;
        case 4:
            TimeFlowOpenorClose();//设置动画的启动或者关闭
            break;
        case 5:
            var startTime = new Date();
            SetTimeFullFlowOrNowToEnd(startTime);
            break;
    }
}
function TimeFlowOpenorClose()
{
    var clockViewModel =this.viewer.clockViewModel;
    if(clockViewModel.canAnimate)
    {
        clockViewModel.canAnimate = false;
    }
    else
    {
        clockViewModel.canAnimate = true;
    }
}
function TimeFlowGoOrPause()
{
    var clockViewModel =this.viewer.clockViewModel;
    if(clockViewModel.canAnimate)
    {
        if (clockViewModel.shouldAnimate) 
        {
            clockViewModel.shouldAnimate = false;
        } 
        else 
        {
            clockViewModel.shouldAnimate = true;
        }
    }
    else
    {
        SunshineAnalysiseException("请先允许启动动画");
    }
 
}
function SetTimeFullFlowOrNowToEnd(startTime)
{
    var clockViewModel = this.viewer.clockViewModel;
    //设置开始结束时间
    clockViewModel.startTime  =  new Cesium.JulianDate.fromDate(startTime);
    var stopTime = new Date();
    stopTime.setHours(23);
    stopTime.setMinutes(59);
    stopTime.setSeconds(59);
    clockViewModel.stopTime = new Cesium.JulianDate.fromDate(stopTime);
    //开始动画
    clockViewModel.canAnimate = true;
    clockViewModel.shouldAnimate = true;
    clockViewModel.multiplier = "600";
}
function SetTimeNow()
{
    var dateNow = new Date();
    var date  =  new Cesium.JulianDate.fromDate(dateNow);//获取当前时间
    this.viewer.clock.currentTime = date;
}
//打开阴影
function OpenShadows()
{
    try
    {
        var entities = this.viewer.entities.values;
        var entitiesLength = entities.length;
        this.viewer.shadowMap.maxmimumDistance = 10000.0;
        var entityShadows = Cesium.ShadowMode.ENABLED;
        for (i = 0; i < entitiesLength; ++i) {
            var entity = entities[i];
            var visual = entity.model || entity.box || entity.ellipsoid;
            visual.shadows = entityShadows;
        }//实体阴影
        this.viewer.shadowMap.size = 2048;
        this.viewer.shadows = true;//阴影
        this.viewer.shadowMap.softShadows = false;//软化
        this.viewer.terrainShadows =Cesium.ShadowMode.ENABLED;//山体阴影
    }
    catch
    {
        CloseShadows();
        SunshineAnalysiseException("打开阴影失败，请查看源码");
    }
}
//关闭阴影
function CloseShadows()
{
    try
    {
        var entities = this.viewer.entities.values;
        var entitiesLength = entities.length;
        this.viewer.shadowMap.maxmimumDistance = 10000.0;
        var entityShadows = Cesium.ShadowMode.DISABLED;
        for (i = 0; i < entitiesLength; ++i) {
            var entity = entities[i];
            var visual = entity.model || entity.box || entity.ellipsoid;
            visual.shadows = entityShadows;
        }
        this.viewer.shadows = false;
        this.viewer.shadowMap.softShadows = false;
        this.viewer.terrainShadows =Cesium.ShadowMode.DISABLED;
    }
    catch
    {
        SunshineAnalysiseException("关闭阴影失败，请查看源码");
    }
   
}
//判断太阳光是否已经打开
function IsSunLightOpen()
{
    if(this.viewer.scene.globe.enableLighting && this.viewer.scene.sun.show)
    {
        return true;
    }
    else
    {
        if(!this.viewer.scene.globe.enableLighting)
        {
            SunshineAnalysiseException("太阳光未打开");
        }
        if(!this.viewer.scene.sun.show)
        {
            SunshineAnalysiseException("太阳未加载");
        }
        return false;
    }
}
//开启太阳
function OpenSun()
{
    this.viewer.scene.sun.show = true;
}
//关闭太阳
function CloseSun()
{
    this.viewer.scene.sun.show = false;
}
//开启日光
function OpenSunshine()
{
    this.viewer.scene.globe.enableLighting = true;
}
//关闭日光
function CloseSunshine()
{
    this.viewer.scene.globe.enableLighting = false;
}
function SunshineAnalysiseException(str)
{
    throw str;
}
let  Point =
{
    longitude : 0.0,//经度
    latitude:  0.0,//纬度
    czheight : 0.0,//插值高程
    zsheight :0.0//真实高程（要包括建筑我模型）
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     