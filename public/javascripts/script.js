function detectWebGLContext() {
  var supported = [];

  var canvas = document.createElement('canvas');

  var gl = canvas.getContext('experimental-webgl');
  if (gl && gl instanceof WebGLRenderingContext) {
    supported.push('experimental-webgl');
  }

  gl = canvas.getContext('webgl');
  if (gl && gl instanceof WebGLRenderingContext) {
    supported.push('webgl');
  }

  if (typeof WebGL2RenderingContext !== 'undefined') {
    gl = canvas.getContext('webgl2');
    if (gl && gl instanceof WebGL2RenderingContext) {
      supported.push('webgl2');
    }
  }

  return supported;
}

function getDeviceSpec() {
  var specification = {};

  var userAgent = navigator.userAgent;
  var machine = userAgent.substr(userAgent.search('\\(') + 1, userAgent.search('\\)') - userAgent.search('\\(') - 1).split(';');

  specification.chrome = {};
  specification.chrome.version = /Chrome/is.test(userAgent) ? userAgent.substr(userAgent.lastIndexOf('Chrome/') + 'Chrome/'.length).split(' ')[0].split('.')[0] : 0;

  specification.webgl = detectWebGLContext();

  specification.machine = {};
  specification.machine.platform = navigator.platform;
  specification.machine.model = (typeof machine[2]) !== 'undefined' ? machine[2].trim() : 0;
  specification.machine.core = (typeof navigator.hardwareConcurrency) !== 'undefined' ? navigator.hardwareConcurrency : 0;
  specification.machine.ram = (typeof navigator.deviceMemory) !== 'undefined' ? navigator.deviceMemory : 0;


  specification.mac = {};
  specification.mac.version = /Macintosh/is.test(userAgent) ? machine[1].split(' ')[5].split('_')[0] + '.' + machine[1].split(' ')[5].split('_')[1] : 0;
  
  specification.mobile = /Mobile/is.test(userAgent) || /Android/is.test(userAgent) || /iPhone/is.test(userAgent) ? 1 : 0;

  var tabletTerms = [ 'tab', 'pad' ]
  specification.tablet = 0;
  tabletTerms.forEach( terms => {
    if(userAgent.toLowerCase().search(terms) >= 0) {
      specification.tablet |= 1;
    }
  });

  specification.android = {};
  specification.android.version = /Android/is.test(userAgent) ? machine[1].split(' ')[2].split('.')[0] : 0;
  specification.android.arch = (typeof navigator.platform.split(' ')[1]) !== 'undefined' ? navigator.platform.split(' ')[1] : 0;

  specification.iphone = {};
  specification.iphone.version = /iPhone/is.test(userAgent) ? machine[1].split(' ')[4].split('_')[0] : 0;
  

  specification.screen = {};
  specification.screen.width = screen.width * window.devicePixelRatio;
  specification.screen.height = screen.height * window.devicePixelRatio;

  specification.connection = {};
  specification.connection.downlink = (typeof navigator.connection) !== 'undefined' ? navigator.connection.downlink : 0;
  specification.connection.rtt = (typeof navigator.connection) !== 'undefined' ? navigator.connection.rtt : 0;

  // specification.pixel_x = screen.width;
  // specification.pixel_y = screen.height;
  // specification.pixel_ratio = window.devicePixelRatio;

  // specification.window_width = window.innerWidth * window.devicePixelRatio;
  // specification.window_height = window.innerHeight * window.devicePixelRatio;
  // specification.body_width = document.body.offsetWidth * window.devicePixelRatio;
  // specification.body_height = document.body.offsetHeight * window.devicePixelRatio;
  // specification.address_bar_height = document.getElementById('control-height').clientHeight - window.innerHeight;
  // specification.address_bar_height2 = screen.height - window.innerHeight;

  // document.getElementById('json').textContent = JSON.stringify(specification, null, 2);

  return specification;
}

function getResolutionFromQualitiy(qualityCategory) {
  var quality = {};
  quality.low = [640, 480];
  quality.med = [960, 720];
  quality.high = [1280, 960];
  quality.ultra = [1920, 1440];

  return quality[qualityCategory];
}

function pixelToQuality(pixel) {
  if(pixel >= 1440) {
    return 'ultra';
  }

  if(pixel >= 960) {
    return 'high';
  }

  if(pixel >= 720) {
    return 'med';
  }

  return 'low';
}

function tableOfPerformance(arch, core, ram, screen) {
  if(arch === 'armv8l') {
    return 'high'
  }

  if(!arch && !core && !ram) {
    return pixelToQuality(screen);
  }
  
  if(!arch) {
    if(core >= 4 && ram >= 4) {
      return 'high';
    }
    if(core >= 2 && ram >= 2) {
      return 'med';
    }
    return 'low'
  } else {
    if(core >= 4 && ram >= 2) {
      return 'med';
    }
    return 'low'
  }

}

var qualityGlobal = '';

function checkPerformance(specification) {
  var quality = 0;
  var zoom_1_X = 1;
  var zoom_1_5_X = 1.5;
  var heightPerformance = specification.screen.width < specification.screen.height ? specification.screen.width : specification.screen.height;

  // if(!specification.webgl.length) {
  //   return 0;
  // }

  if(specification.webgl.length) {
    if(!specification.mobile) {
      var zoomToUse = zoom_1_X;
    } else {
      if(specification.tablet) {
        var zoomToUse = zoom_1_X;
      } else {
        var zoomToUse = zoom_1_5_X;
      }
      if(specification.iphone.version) {
        // return getQuality('high').push(zoomToUse);
        quality = 'high';
      }
    }
  }

  if(!quality) {
    quality = tableOfPerformance(specification.android.arch, specification.machine.core, specification.machine.ram, heightPerformance)
  }
  
  // document.getElementById('poverlay').innerHTML = 'quality ' + quality.toUpperCase() + ' - zoom ' + zoomToUse;
  qualityGlobal = quality;
  var resolution = getResolutionFromQualitiy(quality)
  var resolutionArray = [];

  resolutionArray.push(resolution[0]);
  resolutionArray.push(resolution[1]);
  resolutionArray.push(zoomToUse);
  
  return resolutionArray;
}

function winDiv(widthWindow, heightWindow) {
  document.getElementById('overlay').style.width = widthWindow + 'px';
  document.getElementById('overlay').style.height = heightWindow + 'px';

  var widthDisplay = widthWindow * window.devicePixelRatio;
  var heightDisplay = heightWindow * window.devicePixelRatio;

  document.getElementById('poverlay').innerHTML = widthDisplay + ' X ' + heightDisplay + ' (Ratio ' + window.devicePixelRatio + ')';
}

function threeDiv(widthWindow, heightWindow, requestWidth, requestHeight, maxZoom, scene) {
  var requestWidthRatio = requestWidth / window.devicePixelRatio;
  var requestHeightRatio = requestHeight / window.devicePixelRatio;

  if(scene) {
    var sceneInt = scene;
  } else {
    var sceneInt = widthWindow > heightWindow ? 'landscape' : 'portrait';
  }

  if(sceneInt === 'landscape') {
    var heightCenter = heightWindow / requestHeightRatio > maxZoom ? requestHeightRatio * maxZoom : heightWindow;
    var widthCenter = Math.floor(heightCenter / 3 * 4);
    var widthSide = (widthWindow - widthCenter) / 2;
    var heightSide = heightWindow;
  }

  if(sceneInt === 'portrait') {
    var widthCenter = widthWindow / requestWidthRatio > maxZoom ? requestWidthRatio * maxZoom : widthWindow;
    var heightCenter = Math.floor(widthCenter / 4 * 3);
    var heightSide = (heightWindow - heightCenter) / 2;
    var widthSide = widthWindow;
  }
  
  document.getElementById('sidel').style.width = widthSide + 'px';
  document.getElementById('sidel').style.height = heightSide + 'px';
  document.getElementById('center').style.width = widthCenter + 'px';
  document.getElementById('center').style.height = heightCenter + 'px';
  document.getElementById('sider').style.width = widthSide + 'px';
  document.getElementById('sider').style.height = heightSide + 'px';

  heightCenter *= window.devicePixelRatio;
  widthCenter *= window.devicePixelRatio;
  widthSide *= window.devicePixelRatio;
  heightSide *= window.devicePixelRatio;

  document.getElementById('psidel').innerHTML = widthSide + ' X ' + heightSide;
  document.getElementById('pcenter').innerHTML = widthCenter + ' X ' + heightCenter + ' (quality: ' + qualityGlobal + ' - zoom: ' + Math.round(heightCenter / requestHeight * 100) / 100 + ')';
  document.getElementById('psider').innerHTML = widthSide + ' X ' + heightSide;
}

// if((typeof window.orientation) !== 'undefined') {
//   var scene = window.orientation.type.toLowerCase().search('landscape') >= 0 ? 'landscape' : 'portrait';
// } else {
//   var scene = 0;
// }

function drawThreeDiv(scene) {
  if(specification.iphone.version) {
    var widthWindow = window.innerWidth;
    var heightWindows = window.innerHeight; 
  } else {
    // document.body.style.height = '100vh';
    // document.body.style.height = (document.body.offsetHeight - addressBarHeight) + 'px';
    document.body.style.height = (document.getElementById('control-height').offsetHeight - addressBarHeight) + 'px';
    var widthWindow = document.body.offsetWidth;
    var heightWindows = document.body.offsetHeight; // - addr
  }
  winDiv(widthWindow, heightWindows);
  threeDiv(widthWindow, heightWindows, widthToUse, heightToUSe, zoomToUse, scene);

  // document.getElementById('json').textContent = 'window: ' + window.innerWidth * window.devicePixelRatio + ' x ' + window.innerHeight * window.devicePixelRatio + '\n';
  // document.getElementById('json').textContent += 'body: ' + document.body.offsetWidth * window.devicePixelRatio + ' x ' + document.body.offsetHeight * window.devicePixelRatio  + '\n';
  // document.getElementById('json').textContent += 'address bar : ' + (document.body.offsetHeight - window.innerHeight) * window.devicePixelRatio;
}

var specification = getDeviceSpec();
if(specification.mobile) {
  window.addEventListener('orientationchange', function() {
    window.addEventListener('resize', function() {
      drawThreeDiv(0);
    }, false);
  }, false);
} else {
  window.addEventListener('resize', function() {
    var scene = 'portrait';
    if(document.body.offsetWidth > (widthToUse * window.innerHeight / heightToUSe)) {
      scene = 'landscape';
    }
    drawThreeDiv(scene);
  }, false);
}

var addressBarHeight = 0;
var widthToUse = 0;
var heightToUSe = 0;
var zoomToUse = 0;

document.addEventListener('DOMContentLoaded', init, false);

function init(){
  performance = checkPerformance(specification);
  widthToUse = performance[0];
  heightToUSe = performance[1];
  zoomToUse = performance[2];

  addressBarHeight = document.getElementById('control-height').offsetHeight - window.innerHeight;
  
  drawThreeDiv();

  console.log(specification);
}
