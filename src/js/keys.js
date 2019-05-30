var k = require('mousetrap');


function bindKeys(app) {
  k.bind('space', () => {
    var cube = app.scene.getObjectByName('Cube');
    console.log(cube);
    cube.visible = !cube.visible;
  });


  // Skybox
  k.bind('w', () => {
    console.log('w');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.x.add(0.001)
  })

  k.bind('e', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.y.add(0.001)
  })

  k.bind('r', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.z.add(0.001)
  })

  k.bind('shift+w', () => {
    console.log('w');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.x.add(-0.001)
  })

  k.bind('shift+e', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.y.add(-0.001)
  })

  k.bind('shift+r', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.z.add(-0.001)
  })

  k.bind('ctrl+w', () => {
    console.log('w');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.x.loopTo(0)
  })

  k.bind('ctrl+e', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.y.loopTo(0)
  })

  k.bind('ctrl+r', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.z.loopTo(0)
  })

  k.bind('alt+w', () => {
    console.log('w');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.x.startLoop()
  })

  k.bind('alt+e', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.y.startLoop(0)
  })

  k.bind('alt+r', () => {
    console.log('e');
    var skybox = app.scene.getObjectByName('Skybox')
    skybox.rotation.speed.z.startLoop(0)
  })

  k.bind('q', () => {
    app.skyboxColorIntensity.loopTo(0.0)
  })
  k.bind('alt+q', () => {
    app.skyboxColorIntensity.startLoop()
  })

  k.bind('a', () => {
    newpalette = Math.floor(Math.random() * app.colors.length)
    while(newpalette == app.skyboxPalette) {
      newpalette = Math.floor(Math.random() * app.colors.length)
    }
    app.skyboxPalette = newpalette
    app.uniforms.skyboxStartColor.value = app.colors[app.skyboxPalette][0]
    app.uniforms.skyboxEndColor.value = app.colors[app.skyboxPalette][1]
  })

  // Change color palette randomly






  // Shapes
  // Remove shapes
  k.bind('z', () => {
    var group = app.scene.getObjectByName('Group of Boxes');
    app.scene.remove(group);
  })

  // New random shapes
  k.bind('x', () => {
    console.log('r');
    var group = app.scene.getObjectByName('Group of Boxes');
    app.scene.remove(group);

    const boxSpecs = {
      depth: 20,
      height: 10,
      spread: { x: 100, y: 100, z: 50 },
      width: 5,
      type: 0
    };
    const behavior = 0;
    app.addGroupObject(10, boxSpecs, behavior);
  });

  // New random shapes
  k.bind('c', () => {
    console.log('r');
    var group = app.scene.getObjectByName('Group of Boxes');
    app.scene.remove(group);

    const boxSpecs = {
      depth: 20,
      height: 10,
      spread: { x: 100, y: 100, z: 50 },
      width: 5,
      type: 1
    };
    const behavior = 1;
    app.addGroupObject(10, boxSpecs, behavior);
  });

  // New boxes

  // New cylinders

  // New spheres

  // Change colors?




  // Central shape

  // Bigger


  // Bump size
  k.bind('p', () => {
    app.centerObjectScale.loopTo(1.0);
  })

  // X wiggle
  k.bind('o', () => {
    app.wiggleIntensityX.loopTo(0.0);
  })
  // Loop x wiggle
  k.bind('alt+o', () => {
    app.wiggleIntensityX.startLoop();
  })

  // Y Wiggle
  k.bind('i', () => {
    app.wiggleIntensityY.loopTo(0.0);
  })
  // loop y wiggle
  k.bind('alt+i', () => {
    app.wiggleIntensityY.startLoop();
  })

  // Change color palette randomly
  k.bind('u', () => {
    newpalette = Math.floor(Math.random() * app.colors.length)
    while(newpalette == app.centralObjectPalette) {
      newpalette = Math.floor(Math.random() * app.colors.length)
    }
    app.centralObjectPalette = newpalette
    app.uniforms.startColor.value = app.colors[app.centralObjectPalette][0]
    app.uniforms.endColor.value = app.colors[app.centralObjectPalette][1]
  })


}

module.exports = bindKeys