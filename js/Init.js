var viewer = OnLoad(Cesium);
ShowBuilder();
var SunshineAnalysis = new SunshineAnalysis(viewer);
var VisualAngle = new VisualAngle(viewer);
VisualAngle.KeyboardControlPerspective();
//VisualAngle.MouseControlCamera(true);
SunshineAnalysis.SetTimeFlow(timeType.NowTime);
function SetTimeFull()
{
    SunshineAnalysis.SetTimeFlow(timeType.TimeFullFlow);
}
