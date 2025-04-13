import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;
const frustumHeight = 6; // Adjust this to zoom in/out
const frustumWidth = frustumHeight * aspect;

const camera = new THREE.OrthographicCamera(
  -frustumWidth / 2,
  frustumWidth / 2,
  frustumHeight / 2,
  -frustumHeight / 2,
  0.1,
  100
);

camera.position.set(10, 0, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;




const colors = {
  red: '#ed1e24',
  blue: '#01aeec', // Lighter blue
  yellow: '#FFFF00',
  orange: '#FFA500',
  green: '#39b54a',
  purple: '#bc5e91',
};

function interpolateColors(color1, color2, alpha) {
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const rgbToHex = (r, g, b) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r * (1 - alpha) + rgb2.r * alpha);
  const g = Math.round(rgb1.g * (1 - alpha) + rgb2.g * alpha);
  const b = Math.round(rgb1.b * (1 - alpha) + rgb2.b * alpha);

  return rgbToHex(r, g, b);
}

function straightPart (frontColors, backColors, colorBeta, X, startY, endY, Z1, Z2) {
  const numSteps = 100;
  const step = (endY - startY) / numSteps;
  let lastY = startY;



  for (let i = 1; i <= numSteps; i++) {
    const thisY = startY + i * step;
    const alpha = i  / numSteps;
    const frontColor = interpolateColors(frontColors[0], frontColors[1], alpha * colorBeta);
    const backColor = interpolateColors(backColors[0], backColors[1], alpha * colorBeta);
    

    // Vertices for "M" shape (XY plane)
    const vertices = new Float32Array([
      X, lastY, Z1,     // 0 bottom left
      X, lastY, Z2,     // 1 bottom right
      X, thisY, Z1,   // 2 top  left
      X, thisY, Z2,   // 3 top right
    ]);

    const indices = [
      0, 1, 2,  2, 1, 3
    ];

    const frontMaterial = new THREE.MeshBasicMaterial({
      color: frontColor,
      side: THREE.FrontSide
    });
    
    const backMaterial = new THREE.MeshBasicMaterial({
      color: backColor,
      side: THREE.BackSide
    });

    lastY = thisY;




    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

      
    const frontMesh = new THREE.Mesh(geometry, frontMaterial);
    const backMesh = new THREE.Mesh(geometry, backMaterial);

    scene.add(frontMesh);
    scene.add(backMesh);


  }
}


function curvedPart(insideColors, outsideColors, colorBeta, centerX, centerY, radius, Z1, Z2) {
  const numSteps = 100;
  const step = (Math.PI * 0.5) / numSteps;  

  for (let i = 0; i < numSteps; i++) {
    const alpha = i / numSteps;
    const angle1 = i * step;
    const angle2 = (i + 1) * step;

    const frontColor = interpolateColors(outsideColors[0], outsideColors[1], alpha * colorBeta + 1-colorBeta);
    const backColor = interpolateColors(insideColors[0], insideColors[1], alpha * colorBeta + 1-colorBeta);

    const vertices = new Float32Array([
      centerX + radius * Math.cos(angle1), centerY + radius * Math.sin(angle1), Z1,     // 0 bottom left
      centerX + radius * Math.cos(angle1), centerY + radius * Math.sin(angle1), Z2,     // 1 bottom right
      centerX + radius * Math.cos(angle2), centerY + radius * Math.sin(angle2), Z1,   // 2 top  left
      centerX + radius * Math.cos(angle2), centerY + radius * Math.sin(angle2), Z2,   // 3 top right

      centerX - radius * Math.cos(angle1), centerY + radius * Math.sin(angle1), Z2,     // 0 bottom left
      centerX - radius * Math.cos(angle1), centerY + radius * Math.sin(angle1), Z1,     // 1 bottom right
      centerX - radius * Math.cos(angle2), centerY + radius * Math.sin(angle2), Z2,   // 2 top  left
      centerX - radius * Math.cos(angle2), centerY + radius * Math.sin(angle2), Z1,   // 3 top right
    ]);

    const indices = [
      0, 1, 2,  2, 1, 3,
      4, 5, 6,  6, 5, 7 
    ];

    const frontMaterial = new THREE.MeshBasicMaterial({
      color: frontColor,
      side: THREE.FrontSide
    });
    
    const backMaterial = new THREE.MeshBasicMaterial({
      color: backColor,
      side: THREE.BackSide
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const frontMesh = new THREE.Mesh(geometry, frontMaterial);
    const backMesh = new THREE.Mesh(geometry, backMaterial);

    scene.add(frontMesh); 
    scene.add(backMesh);


  }
}

const xGap = 2;
const betaStraight = 0.6
const botY = -0.7

straightPart([colors.blue, colors.green], [colors.red, colors.orange], betaStraight, -xGap, botY, 1, 0.3, 0.9);
straightPart([colors.blue, colors.purple], [colors.yellow, colors.orange], betaStraight, -xGap, botY, 1, -0.3, 0.3);
straightPart([colors.red, colors.purple], [colors.yellow, colors.green], betaStraight, -xGap, botY, 1, -0.9, -0.3);

straightPart([colors.red, colors.orange], [colors.red, colors.orange], betaStraight, 0, botY, 1, 0.3, 0.9);
straightPart([colors.yellow, colors.orange], [colors.yellow, colors.orange], betaStraight, 0, botY, 1, -0.3, 0.3);
straightPart([colors.yellow, colors.green], [colors.yellow, colors.green], betaStraight, 0, botY, 1, -0.9, -0.3);

straightPart([colors.red, colors.orange], [colors.blue, colors.green], betaStraight, xGap, botY, 1, 0.3, 0.9);
straightPart([colors.yellow, colors.orange], [colors.blue, colors.purple], betaStraight, xGap, botY, 1, -0.3, 0.3);
straightPart([colors.yellow, colors.green], [colors.red, colors.purple], betaStraight, xGap, botY, 1, -0.9, -0.3);

const betaCurved = 0.4;
curvedPart([colors.blue, colors.green], [colors.red, colors.orange], betaCurved, -xGap/2, 1, xGap/2, 0.3, 0.9);
curvedPart([colors.blue, colors.purple], [colors.yellow, colors.orange], betaCurved, -xGap/2, 1, xGap/2, -0.3, 0.3);
curvedPart([colors.red, colors.purple], [colors.yellow, colors.green], betaCurved, -xGap/2, 1, xGap/2, -0.9, -0.3);

curvedPart([colors.blue, colors.green], [colors.red, colors.orange], betaCurved, xGap/2, 1, xGap/2, 0.3, 0.9);
curvedPart([colors.blue, colors.purple], [colors.yellow, colors.orange], betaCurved, xGap/2, 1, xGap/2, -0.3, 0.3);
curvedPart([colors.red, colors.purple], [colors.yellow, colors.green], betaCurved, xGap/2, 1, xGap/2, -0.9, -0.3);

// Resize support
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumWidth = frustumHeight * aspect;

  camera.left = -frustumWidth / 2;
  camera.right = frustumWidth / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = -frustumHeight / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});





// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}



animate();


