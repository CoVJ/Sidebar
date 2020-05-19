/*------------------Animated Background ------------------------- */
/* Credit
  This code was taken from
  https://codepen.io/Dillo/pen/yLYGOPd?editors=0110
  This guy its a genius! */
 
"use strict";
window.onload = function() {

  const rayHexMin = 80;
  const rayHexMax = 160;
  let nInterv = 15;    // subdivision of sides (integer)

  let canv, ctx; // canvas and context
  let maxx, maxy;

  let grid;
  let nbx, nby;
  let rayHex;

  let colors;

/* for animation */
  let events = [];

// shortcuts for Math.…

  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const m2PI = Math.PI * 2;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;
  const mPIS3 = Math.PI / 3;

//-----------------------------------------------------------------
  function alea (min, max) {
// random number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') return min * mrandom();
    return min + (max - min) * mrandom();
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function intAlea (min, max) {
// random integer number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') {
      max = min; min = 0;
    }
    return mfloor(min + (max - min) * mrandom());
  } // intAlea

//------------------------------------------------------------------------
// class Hexagon
let Hexagon;
{ // scope for Hexagon

let orgx, orgy;

Hexagon = function (kx, ky) {

  this.kx = kx;
  this.ky = ky;
  this.neighbours = [];

  this.orient = intAlea(6);
  this.kind = (intAlea(2) == 0);

} // function Hexagon

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* static method */

Hexagon.dimensions = function () {
// coordinates of center of hexagon [0][0]
  orgx = (maxx - rayHex * (1.5 * nbx + 0.5)) / 2  + rayHex; // obvious, no ?
  orgy = (maxy - (rayHex * rac3 * (nby + 0.5))) / 2 + rayHex * rac3; // yet more obvious

} // Hexagon.dimensions

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.prototype.size = function() {
/* computes screen sizes / positions
*/
// centre
  this.xc = orgx + this.kx * 1.5 * rayHex;
  this.yc = orgy + this.ky * rayHex * rac3;
  if (this.kx & 1) this.yc -= rayHex * rac3s2; // odd columns

  this.vertices = [[],[],[],[],[],[]] ;

// x coordinates, from left to right
  this.vertices[3][0] = this.xc - rayHex;
  this.vertices[2][0] = this.vertices[4][0] = this.xc - rayHex  / 2;
  this.vertices[1][0] = this.vertices[5][0] = this.xc + rayHex / 2;
  this.vertices[0][0] = this.xc + rayHex;
// y coordinates, from top to bottom
  this.vertices[4][1] = this.vertices[5][1] = this.yc - rayHex * rac3s2;
  this.vertices[0][1] = this.vertices[3][1] = this.yc;
  this.vertices[1][1] = this.vertices[2][1] = this.yc + rayHex * rac3s2;
// get a 2nd copy of table to avoid many % 6 calculations later
  this.vertices = this.vertices.concat(this.vertices);

  this.extCenters = [[],[],[],[],[],[]] ;
  let dxc = rayHex;
  let dyc = rayHex / rac3;
  this.rad1 = dyc; // radius fir circles with center in extCenters

  for (let k = 0; k < 6; ++k) {
    this.extCenters[k][0] = this.xc + dxc * mcos(k * mPIS3) - dyc * msin(k * mPIS3);
    this.extCenters[k][1] = this.yc + dxc * msin(k * mPIS3) + dyc * mcos(k * mPIS3);
  }
// get a 2nd copy of table to avoid many % 6 calculations later
  this.extCenters = this.extCenters.concat(this.extCenters);

  this.extCentersB = [[],[],[],[],[],[]] ;
// x coordinates, from left to right
  this.extCentersB[3][0] = this.xc - 2 * rayHex;
  this.extCentersB[2][0] = this.extCentersB[4][0] = this.xc - rayHex;
  this.extCentersB[1][0] = this.extCentersB[5][0] = this.xc + rayHex;
  this.extCentersB[0][0] = this.xc + 2 * rayHex;

// y coordinates, from top to bottom
  this.extCentersB[4][1] = this.extCentersB[5][1] = this.yc - rayHex * rac3;
  this.extCentersB[3][1] = this.extCentersB[0][1] = this.yc;
  this.extCentersB[2][1] = this.extCentersB[1][1] = this.yc + rayHex * rac3;
// get a 2nd copy of table to avoid many % 6 calculations later
  this.extCentersB = this.extCentersB.concat(this.extCentersB);

} // Hexagon.prototype.size

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/* draws arc from vertex 'vert' to vertex 'vert + 1' (jumps over 1 side) */

Hexagon.prototype.drawArc1 = function (vert) {

  ctx.beginPath();

  ctx.moveTo (this.vertices[vert + 1][0], this.vertices[vert + 1][1]);
  ctx.arc(this.extCenters[vert][0], this.extCenters[vert][1], this.rad1, (2 * vert + 5) * mPI / 6, (2 * vert - 3) * mPI / 6);

  let alpha, x0, y0, xc, yc, R;

  for (let k = 1; k < nInterv / 2; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex * (1 - alpha / 2);
    y0 = alpha * rayHex * rac3s2;
    yc = xc / rac3
    R = rayHex * (1 - 2 * alpha) / rac3;

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);
    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert - 3) * mPI / 6,(2 * vert + 5) * mPI / 6 , true);

  } // for k
  ctx.strokeStyle = colors[vert % 3];
  ctx.stroke();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* does not include begin path nor stroke */
/* draws arc from vertex 'vert + 2 ' to vertex 'vert' (jumps over 2 sides) */
Hexagon.prototype.drawArc2 = function (vert) {

  ctx.beginPath();
  ctx.moveTo (this.vertices[vert + 2][0], this.vertices[vert + 2][1]);
  ctx.arc(this.extCentersB[vert + 1][0], this.extCentersB[vert + 1][1], rayHex * rac3, (2 * vert - 5) * mPI / 6, (2 * vert - 3) * mPI / 6);

  let alpha, x0, y0, xc, yc, R, xb, yb, angle;

  for (let k = 1; k < nInterv; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex;
    y0 = 0;
    yc = ((0.5 + alpha) * (0.5 + alpha) + 0.75) / rac3 * rayHex;
    R = yc;
    angle = matan2(rayHex * ( 1/2 + alpha), yc - rayHex * rac3s2);

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);
    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert - 3) * mPI / 6,(2 * vert - 3) * mPI / 6 - angle , true);

  } // for k

  ctx.strokeStyle = colors[(vert + 1) % 3];
  ctx.stroke();

  ctx.beginPath();
  for (let k = 1; k < nInterv; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex;
    y0 = 0;
    xb = rayHex * (- 1 / 2 - alpha / 2);
    yb = (1 - alpha) * rac3s2 * rayHex;

    yc = (yb * yb + xb * xb - x0 * x0 + 2 * x0 * xc  - 2 * xb * xc) / 2 / yb;
    R = yc;

    angle = matan2(rayHex - xb, yc - yb);

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);

    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert - 3) * mPI / 6,(2 * vert - 3) * mPI / 6 - angle , true);

  } // for k
  ctx.strokeStyle = colors[(vert + 2) % 3];
  ctx.stroke();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* does not include begin path nor stroke */
/* draws arc from vertex 'vert + 3' to vertex 'vert' (jumps over 3 sides) */
/* a straight line in fact */
Hexagon.prototype.drawArc3 = function (vert) {
  ctx.beginPath();
  ctx.moveTo (this.vertices[vert + 3][0], this.vertices[vert + 3][1]);
  ctx.lineTo(this.vertices[vert][0], this.vertices[vert][1]);
  ctx.stroke();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* does not include begin path nor stroke */
/* draws arc from vertex 'vert + 4' to vertex 'vert' (jumps over 2 sides) */
Hexagon.prototype.drawArc4 = function (vert) {

  ctx.beginPath();
  ctx.moveTo (this.vertices[vert + 4][0], this.vertices[vert + 4][1]);
  ctx.arc(this.extCentersB[vert + 5][0], this.extCentersB[vert + 5][1], rayHex * rac3, (2 * vert + 5) * mPI / 6, (2 * vert + 3) * mPI / 6, true);

  let alpha, x0, y0, xc, yc, R, xb, yb, angle;

  for (let k = 1; k < nInterv; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex;
    y0 = 0;
    yc = - ((0.5 + alpha) * (0.5 + alpha) + 0.75) / rac3 * rayHex;
    R = - yc;
    angle = matan2(rayHex * ( 1/2 + alpha),  R - rayHex * rac3s2);

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);
    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert + 3) * mPI / 6,(2 * vert + 3) * mPI / 6 + angle);

  } // for k
  ctx.strokeStyle = colors[(vert + 1) % 3];
  ctx.stroke();

  ctx.beginPath();
  for (let k = 1; k < nInterv; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex;
    y0 = 0;
    xb = rayHex * (- 1 / 2 - alpha / 2);
    yb = (alpha - 1) * rac3s2 * rayHex;

    yc = (yb * yb + xb * xb - x0 * x0 + 2 * x0 * xc  - 2 * xb * xc) / 2 / yb;
    R = - yc;

    angle = matan2(rayHex - xb, R + yb);

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);

    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert + 3) * mPI / 6,(2 * vert + 3) * mPI / 6 + angle);

  } // for k
  ctx.strokeStyle = colors[vert % 3];
  ctx.stroke();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* does not include begin path nor stroke */
/* draws arc from vertex 'vert' to vertex 'vert - 1' (jumps over 1 side) */
Hexagon.prototype.drawArc5 = function (vert) {

  ctx.beginPath();
  ctx.moveTo (this.vertices[vert + 5][0], this.vertices[vert + 5][1]);
  ctx.arc(this.extCenters[vert + 5][0], this.extCenters[vert + 5][1], this.rad1, (2 * vert - 5) * mPI / 6, (2 * vert + 3) * mPI / 6, true);

  let alpha, x0, y0, xc, yc, R;

  for (let k = 1; k < nInterv / 2; ++k) {
    alpha = k / nInterv;
    xc = x0 = rayHex * (1 - alpha / 2);
    y0 = -alpha * rayHex * rac3s2;
    yc = -xc / rac3
    R = rayHex * (1 - 2 * alpha) / rac3;

    [x0, y0] = rotate([x0, y0], 2 * vert);
    [xc, yc] = rotate([xc, yc], 2 * vert);
    ctx.moveTo (this.xc + x0, this.yc + y0);
    ctx.arc (this.xc + xc, this.yc + yc, R, (2 * vert + 3) * mPI / 6,(2 * vert - 5) * mPI / 6);

  } // for k

  ctx.strokeStyle = colors[(vert + 2) % 3];
  ctx.stroke();

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.prototype.drawA = function () {

  ctx.lineWidth = 2;

  if (! this.vertices) this.size();

  let vert = this.vertices;
  let ext = this.extCenters;
  let extB = this.extCentersB;
  let dir = this.orient;

  this.drawArc1(dir);
  this.drawArc2(dir);
  this.drawArc3(dir);

  if (this.kind) {
    this.drawArc4(dir);
    this.drawArc5(dir);
  } else {
    this.drawArc2((dir + 3) % 6);
    this.drawArc1((dir + 3) % 6);
  }

} // Hexagon.prototype.drawA

} // scope for Hexagon
//------------------------------------------------------------------------
function rotate (p, k) {

// turn the given point after a rotation of k / 12 turns (k * PI / 6) around the origin
  let s = msin (k * mPI / 6);
  let c = mcos (k * mPI / 6);
  return [p[0] * c - p[1] * s,
          p[0] * s + p[1] * c];
} // rotate

//------------------------------------------------------------------------

function createGrid() {
/* create the grid of Hexagons
  and defines the number of dots on each side of the hexagons
  but does NOT define the crossings between dots inside an hexagon
*/
  let hexa;
  grid = [];

  for (let ky = 0; ky < nby; ++ky) {
    grid[ky] = []
    for (let kx = 0; kx < nbx; ++kx) {
      hexa = new Hexagon(kx, ky);
      grid[ky][kx] = hexa;
    } // for kx
  } // for ky
} // createGrid

//-----------------------------------------------------------------------------
let animate;
{ // scope for animate
  let animState = 0;

  animate = function(tStamp) {
    let event = events.pop();
    requestAnimationFrame(animate)
    if (event) {
      switch (event.event) {
        case 'reset' :
          animState = 0;
          break;
      } // switch (event)
    } // if (event)

    switch (animState) {
      case 0 :
        if (startOver()) ++animState;
    } // switch (animState)

  } // animate

} // scope for animate

//-----------------------------------------------------------------
function startOver() {
// canvas dimensions

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  let orgLeft = mmax (((window.innerWidth ) - maxx) / 2, 0);
  let orgTop = mmax (((window.innerHeight ) - maxy) / 2, 0);

  canv.style.left = orgLeft + 'px';
  canv.style.top = orgTop + 'px';

  if (maxx != canv.width) canv.width = maxx;
  if (maxy != canv.height) canv.height = maxy;

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineCap = 'round';   // placed here because reset when canvas resized
  ctx.lineJoin = 'round';
  
// number of columns / rows
// computed to have (0,0) in top leftmost corner
// and for all hexagons to be fully contained in canvas

  rayHex = alea(rayHexMin, rayHexMax);

  nbx = mfloor(((maxx / rayHex) - 0.5) / 1.5);
  nby = mfloor(maxy / rayHex / rac3 - 0.5); //

  nbx += 3; // to have canvas fully covered by hexagons
  nby += 3;
  if (nbx <= 3 || nby <= 3) return false; // nothing to do

  Hexagon.dimensions();
  createGrid();

  let hue = intAlea(360);
  let dHue = 120 * intAlea(3);

  nInterv = (dHue == 0) ? 7 : 15;
  colors = [`hsl(${hue}, 100%, 50%)`,
            `hsl(${(hue + dHue) % 360}, 100%, 50%)`,
            `hsl(${(hue + 2 * dHue) % 360}, 100%, 50%)`];

  grid.forEach(line => {
    line.forEach(cell => {
      cell.drawA();
    });
  });
  return true;
} // startOver

//-----------------------------------------------------------------
// beginning of execution

  {
    canv = document.createElement('canvas');
    canv.style.position="absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
    canv.addEventListener('click', ()=> {events.push({event:'reset'})});
  } // canvas creation

  events.push({event:'reset'});
  requestAnimationFrame(animate)
} // window.onload


