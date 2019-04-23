  //加载建筑物
  function ShowBuilder()
  {
    LoadingShow();
    var scene=viewer.scene;
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
       Cesium.Cartesian3.fromDegrees(116.40387397,39.91488908, 100)
      );
    //获取gltf信息，将gltf文件获取
    var model = Cesium.Model.fromGltf({
       url : '../Cesium/Assets/builder/builder.gltf',//如果为bgltf则为.bgltf
       modelMatrix : modelMatrix,
       scale : 20
    });
    //在场景中添加Gltf模型
    scene.primitives.add(model);
    //回调加载出glft模型的事件，加载出来以后再放大到目标位置
    Cesium.when(model.readyPromise).then(function(model) {
    viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(116.40387397 ,39.91488908, 100)}
      );
      LoadingDisappear();
      SunshineAnalysis.OpenShadows();
      
    }).otherwise(function(error){
    window.alert(error);
   });
    
  }
  