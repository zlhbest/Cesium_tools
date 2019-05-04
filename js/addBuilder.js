  //加载建筑物
  function ShowBuilder()
  {
    LoadingShow();
    var scene=viewer.scene;
    var position = Cesium.Cartesian3.fromDegrees(116.40387397 ,39.91488908,100);
    var heading = Cesium.Math.toRadians(0);
    var pitch = Cesium.Math.toRadians(0);
    var roll = Cesium.Math.toRadians(0.0);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));
    var entity = viewer.entities.add({
      position : position,
      orientation : orientation,
      model : {
          uri : '../Cesium/Assets/builder/builder.gltf'
      }
     });
    viewer.trackedEntity = entity;
    viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(116.40387397 ,39.91488908, 2000)}
      );
    LoadingDisappear();
  //   //回调加载出glft模型的事件，加载出来以后再放大到目标位置
  //   Cesium.when(model.readyPromise).then(function(model) {
  //   viewer.camera.flyTo({
  //     destination : Cesium.Cartesian3.fromDegrees(116.40387397 ,39.91488908, 2000)}
  //     );
  //     LoadingDisappear();
  //     SunshineAnalysis.OpenShadows();
  //   }).otherwise(function(error){
  //   window.alert(error);
  //  });
    
  }
  