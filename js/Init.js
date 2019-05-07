var viewer = OnLoad(Cesium);
var wuti = ShowBuilder();
var SunshineAnalysis = new SunshineAnalysis(viewer);
var VisualAngle = new VisualAngle(viewer);
SunshineAnalysis.OpenSun();
var dateNow = new Date();
dateNow.setHours(10);
dateNow.setMinutes(0);
dateNow.setSeconds(0);
var date  =  new Cesium.JulianDate.fromDate(dateNow);//获取当前时间
viewer.clock.currentTime = date;
//VisualAngle.KeyboardControlPerspective();
//VisualAngle.MouseControlCamera(true);//这一步是实现键盘控制视角.
//SunshineAnalysis.SetTimeFlow(timeType.NowTime);
function SetTimeFull()
{
    SunshineAnalysis.SetTimeFlow(timeType.TimeFullFlow);
}
function MouseClick()
{
    //VisualAngle.wuti = wuti;
     VisualAngle.GetMouseDownCoordinateOnBuilder(wuti);
}
function show()
{
    SunshineAnalysis.OpenSun();
    SunshineAnalysis.OpenShadows();
}