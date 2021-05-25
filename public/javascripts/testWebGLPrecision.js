document.addEventListener('DOMContentLoaded', init, false);

function init(){
  var canvas = document.createElement('canvas');
  gl = canvas.getContext('webgl');
  console.log('WebGL highp precision supported', testPrecision(gl, 'highp'));
}

function testPrecision(gl, precision){
  var fragmentSource = 'precision ' + precision + ' float;\nvoid main(){}';
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);        
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    return false;
  }
  return true;
}
