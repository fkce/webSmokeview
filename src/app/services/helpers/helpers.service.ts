import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  //  M =   R  T  =  m0 m4  m8 m12  (R == orthogonal rotation matrix, T == translation vector)
  //        0  1     m1 m5  m9 m13
  //                 m2 m6 m10 m14
  //                 m3 m7 m11 m15

  // the following routines post-multiply M by one of the following transformation matrices

  // rotatate about x axis  1  0 0 0
  //                        0  c s 0    c=cos(angle), s=sin(angle)
  //                        0 -s c 0
  //                        0  0 0 1

  // rotatate about z axis  c  s 0 0
  //                        c -s 0 0
  //                        0  0 1 0
  //                        0  0 0 1

  // translate by (x,y,z)  1 0 0 x
  //                       0 1 0 y
  //                       0 0 1 z
  //                       0 0 0 1

  // scale by (x,y,z)   x 0 0 0
  //                    0 y 0 0
  //                    0 0 z 0
  //                    0 0 0 1

  public rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv4 = m[4], mv5 = m[5], mv6 = m[6], mv7 = m[7];

    m[4] = m[4] * c + m[8] * s;
    m[5] = m[5] * c + m[9] * s;
    m[6] = m[6] * c + m[10] * s;
    m[7] = m[7] * c + m[11] * s;

    m[8] = m[8] * c - mv4 * s;
    m[9] = m[9] * c - mv5 * s;
    m[10] = m[10] * c - mv6 * s;
    m[11] = m[11] * c - mv7 * s;
    return m;
  }

  public rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv1 = m[1], mv2 = m[2], mv3 = m[3];

    m[0] = m[0] * c + m[4] * s;
    m[1] = m[1] * c + m[5] * s;
    m[2] = m[2] * c + m[6] * s;
    m[3] = m[3] * c + m[7] * s;

    m[4] = m[4] * c - mv0 * s;
    m[5] = m[5] * c - mv1 * s;
    m[6] = m[6] * c - mv2 * s;
    m[7] = m[7] * c - mv3 * s;
    return m;
  }

  public translateXYZ(m, X, Y, Z) {
    m[12] += m[0] * X + m[4] * Y + m[8] * Z;
    m[13] += m[1] * X + m[5] * Y + m[9] * Z;
    m[14] += m[2] * X + m[6] * Y + m[10] * Z;
    return m;
  }

  public scaleXYZ(m, X, Y, Z) {
    m[0] *= X, m[4] *= Y, m[8] *= Z;
    m[1] *= X, m[5] *= Y, m[9] *= Z;
    m[2] *= X, m[6] *= Y, m[10] *= Z;
    m[3] *= X, m[7] *= Y, m[11] *= Z;
    return m;
  }


  public scaleAll(m, X) {
    m[0] *= X, m[4] *= X, m[8] *= X;
    m[1] *= X, m[5] *= X, m[9] *= X;
    m[2] *= X, m[6] *= X, m[10] *= X;
    m[3] *= X, m[7] *= X, m[11] *= X;
    return m;
  }

  public scaleZ(m, Z) {
    m[8] *= Z;
    m[9] *= Z;
    m[10] *= Z;
    m[11] *= Z;
    return m;
  }

  public mat_transpose(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]
    ];
  }

  public dot_prod(b, sb, c, sc) {
    return b[sb] * c[sc] +
      b[sb + 4] * c[sc + 1] +
      b[sb + 8] * c[sc + 2] +
      b[sb + 12] * c[sc + 3];
  }

  public mat_mult(b, c) {
    return [
      this.dot_prod(b, 0, c, 0), this.dot_prod(b, 1, c, 0), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 0),
      this.dot_prod(b, 0, c, 1), this.dot_prod(b, 1, c, 1), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 1),
      this.dot_prod(b, 0, c, 2), this.dot_prod(b, 1, c, 2), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 2),
      this.dot_prod(b, 0, c, 3), this.dot_prod(b, 1, c, 3), this.dot_prod(b, 2, c, 0), this.dot_prod(b, 3, c, 3)
    ];
  }

  public mat_inverse(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (det == 0.0) det = 1.0;
    det = 1.0 / det;
    var out0 = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    var out1 = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    var out2 = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    var out3 = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    var out4 = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    var out5 = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    var out6 = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    var out7 = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    var out8 = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    var out9 = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    var out10 = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    var out11 = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    var out12 = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    var out13 = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    var out14 = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    var out15 = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return [
      out0, out1, out2, out3,
      out4, out5, out6, out7,
      out8, out9, out10, out11,
      out12, out13, out14, out15
    ];
  }

  public getProjection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
      0.5 / ang, 0, 0, 0,
      0, 0.5 * a / ang, 0, 0,
      0, 0, -(zMax + zMin) / (zMax - zMin), -1,
      0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
  }


}
