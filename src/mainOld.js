import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const colors = {
  red: '#FF0000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  orange: '#FFA500',
  green: '#008000',
  purple: '#800080',
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


function leftTunnel(c1, c2, xPos, zPos, yLeg, radius) {
  const firstColor = c1;
  const secondColor = interpolateColors(c1, c2, 3/4);

  // Create a series of rectangles
  const numRectangles = yLeg;
  const rectangleWidth = 2 * zDistance;
  const rectangleHeight = 3;

  for (let i = 0; i < numRectangles; i++) {
    const alpha = i / (numRectangles - 1); // Interpolation factor
    const color = interpolateColors(firstColor, secondColor, alpha);

    const rectangleGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
    const rectangleMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

    // Position the rectangle
    rectangle.position.set(xPos, i, zPos);
    rectangle.rotation.y = Math.PI / 2; // Rotate to align with the z-axis

    // Add the rectangle to the scene
    scene.add(rectangle);
  }
  const numArcRectangles = 180;
  const centerX = xPos + radius;
  const centerY = yLeg  + radius;

  for (let i = 0; i < numArcRectangles; i++) {
    const alpha = i / (numArcRectangles - 1); // Interpolation factor
    const color = interpolateColors(secondColor, c2, alpha);

    const angle = (Math.PI / 2) * (i / (numArcRectangles - 1)); // Angle for 1/4 circle
    const x = centerX - radius * Math.cos(angle);
    const y = yLeg + radius * Math.sin(angle); // Subtract to go downward

    const rectangleGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
    const rectangleMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

    // Position the rectangle
    rectangle.position.set(x, y, zPos);
    rectangle.rotation.y = Math.PI / 2; // Rotate to align with the z-axis
    rectangle.rotation.z = -angle; // Rotate to align with the arc
    rectangle.rotation.x = +angle; // Rotate to align with the arc

    // Add the rectangle to the scene
    scene.add(rectangle);
  }
}

function rightTunnel(c1, c2, xPos, zPos, yLeg, radius) {
  const firstColor = c1;
  const secondColor = interpolateColors(c1, c2, 3/4);

  // Create a series of rectangles
  const numRectangles = yLeg;
  const rectangleWidth = 2 * zDistance;
  const rectangleHeight = 3;

  for (let i = 0; i < numRectangles; i++) {
    const alpha = i / (numRectangles - 1); // Interpolation factor
    const color = interpolateColors(firstColor, secondColor, alpha);

    const rectangleGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
    const rectangleMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const rectangleMaterialFront = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
    const rectangleMaterialBack = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });

    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
    const rectangleFront = new THREE.Mesh(rectangleGeometry, rectangleMaterialFront);
    const rectangleBack = new THREE.Mesh(rectangleGeometry, rectangleMaterialBack);

    // Position the rectangle
    rectangle.position.set(xPos, i, zPos);
    rectangle.rotation.y = Math.PI / 2; // Rotate to align with the z-axis
    rectangleFront.position.set(xPos, i, zPos); 
    rectangleFront.rotation.y = Math.PI / 2; // Rotate to align with the z-axis
    rectangleBack.position.set(xPos, i, zPos); 
    rectangleBack.rotation.y = Math.PI / 2; // Rotate to align with the z-axis

    // Add the rectangle to the scene
    scene.add(rectangleFront);
    scene.add(rectangleBack);
  }
  const numArcRectangles = 180;
  const centerX = xPos - radius;
  const centerY = yLeg + radius;

  for (let i = 0; i < numArcRectangles; i++) {
    const alpha = i / (numArcRectangles - 1); // Interpolation factor
    const color = interpolateColors(secondColor, c2, alpha);

    const angle = (Math.PI / 2) * alpha; // Angle for 1/4 circle
    const x = centerX + radius * Math.cos(angle);
    const y = yLeg + radius * Math.sin(angle); // Subtract to go downward

    const rectangleGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
    const rectangleMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

    const rectangleFrontGeometry = new THREE.Mesh(rectangleGeometry, rectangleMaterialFront);
    const rectangleBackGeometry = new THREE.Mesh(rectangleGeometry, rectangleMaterialBack);
    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);


    // Position the rectangle
    rectangle.position.set(x, y, zPos);
    rectangle.rotation.y = Math.PI / 2; // Rotate to align with the z-axis
    rectangle.rotation.z = +angle; // Rotate to align with the arc
    rectangle.rotation.x = -angle; // Rotate to align with the arc

    

    // Add the rectangle to the scene
    scene.add(rectangle);
  }
}





// Create the scene
const scene = new THREE.Scene();

// Create the camera
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// camera.position.z = 800;
// camera.position.y = 0;
// camera.position.x = -200;

const r = window.innerWidth / window.innerHeight;


// const camera = new THREE.OrthographicCamera(
//   -500,
//   500,
//   -500/r,
//   500/r,
//   -100,
//   1000 
// )

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, -100, 100);


camera.position.set(-200, 300, -50);  // or some other vantage point
camera.lookAt(new THREE.Vector3(-200, 300, 0));
//camera.up.set(0, 1, 0);

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the geometry and materials
const geometry = new THREE.PlaneGeometry(2, 2);
const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });




// Create the geometry and material for the rectangle
const rectangleGeometry = new THREE.PlaneGeometry(10, 200);
const rectangleMaterialFront = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
const rectangleMaterialBack = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });

// Create the rectangle mesh
const rectangleFront1 = new THREE.Mesh(rectangleGeometry, rectangleMaterialFront);
const rectangleBack1 = new THREE.Mesh(rectangleGeometry, rectangleMaterialBack);

const zDistance = 20;
// Position the rectangle
//rectangleFront1.position.set(-400, 0, zDistance); // Slightly in front of the other planes to avoid z-fighting
// rectangleBack1.position.set(-400, 0, -zDistance); // Slightly behind the other planes to avoid z-fighting

// Create copies of the rectangle with x values of -200 and 0
// const rectangleFront2 = rectangleFront1.clone();
// rectangleFront2.position.set(-200, 0, zDistance);
// const rectangleBack2 = rectangleFront1.clone();
// rectangleBack2.position.set(-200, 0, -zDistance);

// const rectangleFront3 = rectangleFront1.clone();
// rectangleFront3.position.set(0, 0, zDistance);
// const rectangleBack3 = rectangleFront1.clone();
// rectangleBack3.position.set(0, 0, -zDistance);

// Add the copies to the scene
// scene.add(rectangleFront1);
// scene.add(rectangleBack1);
// scene.add(rectangleFront2);
// scene.add(rectangleBack2);
// scene.add(rectangleFront3);
// scene.add(rectangleBack3);



function tunnel(c1, c2, xCenter, zCenter, yLeg, radius) {
  leftTunnel(c1, c2, xCenter - radius, zCenter, yLeg, radius);
  rightTunnel(c1, c2, xCenter + radius, zCenter, yLeg, radius);
}

// Create the tunnel
const wallHt = 200;
const radius = 95;

tunnel(colors.red, colors.orange, -300, 2*zDistance, 200, radius);
tunnel(colors.yellow, colors.orange, -300, 0, 200, radius);
tunnel(colors.yellow, colors.green, -300, -2*zDistance, 200, radius);

tunnel(colors.red, colors.orange, -100, 2*zDistance, 200, radius);
tunnel(colors.yellow, colors.orange, -100, 0, 200, radius);
tunnel(colors.yellow, colors.green, -100, -2*zDistance, 200, radius);



tunnel(colors.blue, colors.green, -300, 2*zDistance, 200, 100);
tunnel(colors.blue, colors.purple, -300, 0, 200, 100);
tunnel(colors.red, colors.purple, -300, -2*zDistance, 200, 100);

tunnel(colors.blue, colors.green, -100, 2*zDistance, 200, 100);
tunnel(colors.blue, colors.purple, -100, 0, 200, 100);
tunnel(colors.red, colors.purple, -100, -2*zDistance, 200, 100);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`
const newButton = document.createElement('button');
newButton.textContent = 'New Button';
newButton.addEventListener('click', () => {
  alert('New Button Clicked!');
});
document.querySelector('.card').appendChild(newButton);
setupCounter(document.querySelector('#counter'))
