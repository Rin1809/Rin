// client/src/utils/threeUtils.ts

import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Paul West @prisoner849 - https://discourse.threejs.org/t/simple-curved-plane/26647/10
class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(radius: number, ...args: ConstructorParameters<typeof THREE.PlaneGeometry>) {
    super(...args);
    const p = this.parameters as { width: number };
    const hw = p.width * 0.5;
    const a = new THREE.Vector2(-hw, 0);
    const b = new THREE.Vector2(0, radius);
    const c = new THREE.Vector2(hw, 0);
    const ab = new THREE.Vector2().subVectors(a, b);
    const bc = new THREE.Vector2().subVectors(b, c);
    const ac = new THREE.Vector2().subVectors(a, c);
    const r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    const center = new THREE.Vector2(0, radius - r);
    const baseV = new THREE.Vector2().subVectors(a, center);
    const baseAngle = baseV.angle() - Math.PI * 0.5;
    const arc = baseAngle * 2;
    const uv = this.attributes.uv;
    const pos = this.attributes.position;
    const mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i);
      const y = pos.getY(i);
      mainV.copy(c).rotateAround(center, arc * uvRatio);
      pos.setXYZ(i, mainV.x, y, -mainV.y);
    }
    pos.needsUpdate = true;
  }
}

// material cho vong tron trang tri
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  public time: { value: number };

  constructor(parameters: THREE.MeshBasicMaterialParameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
  }
  // dinh nghia type cho shader de tranh loi
  onBeforeCompile(shader: { uniforms: { [key: string]: any }, vertexShader: string }) {
    shader.uniforms.time = this.time;
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    );
  }
}

// mo rong R3F
extend({ BentPlaneGeometry, MeshSineMaterial });