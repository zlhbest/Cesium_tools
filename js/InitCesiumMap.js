function OnLoad()
{
    //这个文件用于初始化map使用
    viewer = new Cesium.Viewer("cesiumContainer",{
    animation: false, //动画控制，默认true
    baseLayerPicker: true, //地图切换控件(底图以及地形图)是否显示,默认显示true
    fullscreenButton: false, //全屏按钮,默认显示true
    geocoder: false, //地名查找,默认true
    timeline: false, //时间线,默认true
    vrButton: false, //双屏模式,默认不显示false
    homeButton: false, //主页按钮，默认true
    infoBox: false, //点击要素之后显示的信息,默认true
    selectionIndicator: true, //选中元素显示,默认true
    sceneModePicker: false, //是否显示投影方式控件
    navigationHelpButton: false, //是否显示帮助信息控件
    // navigationHelpButton: false, //是否显示帮助信息控件
    //imageryProviderViewModels: this._getImageryViewModels(options.mapInitParams.imageryViewModels), //设置影像图列表
    // terrainProviderViewModels: this._getTerrainViewModels(options.mapInitParams.terrainViewModels)//设置地形图列表
    });
    //加入了太阳光
    viewer.scene.globe.enableLighting = true;
    //去除版权信息
    viewer._cesiumWidget._creditContainer.style.display = "none";
    //加载天地图
    viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=7b435c61bff7f77eb49206e10d6397bd",
        layer:'img',
        style:'default',
        tileMatrixSetID:'w',
        format:'tiles',
        maximumLevel: 18
    }));//卫星影像

    viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.gov.cn/cia_w/wmts?tk=7b435c61bff7f77eb49206e10d6397bd",
        layer:'cia', 
        style:'default',
        tileMatrixSetID:'w',
        format:'tiles',
        maximumLevel: 18 
    }));//注记图层
    //根据太阳的位置配置Sence
    return viewer;
}

