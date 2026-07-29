import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { PrimitiveParams, MemoryStats } from '../types';

/**
 * Type guard to verify if a Three.js object is a user-editable 3D mesh
 * (and not a system helper like GridHelper, TransformControls gizmo, VertexHandles, etc.)
 */
export function isUserMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  if (!(obj instanceof THREE.Mesh)) return false;

  let curr: THREE.Object3D | null = obj;
  while (curr) {
    const name = curr.name || '';
    const type = curr.type || '';
    if (
      name === 'GridHelper' ||
      name === 'FaceHighlight' ||
      name === 'VertexHandles' ||
      name === 'TransformControls' ||
      type === 'TransformControlsPlane' ||
      type === 'TransformControlsGizmo'
    ) {
      return false;
    }
    curr = curr.parent;
  }
  return true;
}

/**
 * Safely removes all user 3D objects/meshes from the scene while preserving lights, grid, camera, and controls
 */
export function clearUserObjectsFromScene(scene: THREE.Scene) {
  const toRemove: THREE.Object3D[] = [];
  scene.children.forEach((child) => {
    const name = child.name || '';
    const type = child.type || '';
    if (
      name === 'GridHelper' ||
      name === 'AmbientLight' ||
      name === 'DirLight' ||
      name === 'FillLight' ||
      name === 'TransformControls' ||
      type.includes('Light') ||
      type.includes('Camera')
    ) {
      return;
    }
    toRemove.push(child);
  });
  toRemove.forEach((c) => scene.remove(c));
}

/**
 * Ensures geometry is non-indexed for easy face-by-face manipulation and flat shading
 */
export function convertToNonIndexedFlatGeometry(
  geometry: THREE.BufferGeometry,
  defaultColor: string = '#3b82f6'
): THREE.BufferGeometry {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  nonIndexed.computeVertexNormals();

  const count = nonIndexed.attributes.position.count;

  // If geometry lacks a valid color attribute matching vertex count, populate it
  if (!nonIndexed.attributes.color || nonIndexed.attributes.color.count !== count) {
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(defaultColor);

    for (let i = 0; i < count; i++) {
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    nonIndexed.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  return nonIndexed;
}

/**
 * Creates low-poly primitives with clean vertex count for low memory usage
 */
export function createPrimitiveGeometry(params: PrimitiveParams, defaultColor: string = '#60a5fa'): THREE.BufferGeometry {
  let geom: THREE.BufferGeometry;

  switch (params.type) {
    case 'cube':
      geom = new THREE.BoxGeometry(
        params.width || 2,
        params.height || 2,
        params.depth || 2
      );
      break;

    case 'sphere':
      // Low poly icosphere style
      geom = new THREE.IcosahedronGeometry(
        params.radius || 1.5,
        params.segments || 1
      );
      break;

    case 'cylinder':
      geom = new THREE.CylinderGeometry(
        params.radius || 1,
        params.radius || 1,
        params.height || 2,
        params.radialSegments || 8
      );
      break;

    case 'cone':
      geom = new THREE.ConeGeometry(
        params.radius || 1.2,
        params.height || 2.5,
        params.radialSegments || 6
      );
      break;

    case 'pyramid':
      geom = new THREE.ConeGeometry(
        params.radius || 1.5,
        params.height || 2,
        4
      );
      break;

    case 'plane':
      geom = new THREE.PlaneGeometry(
        params.width || 3,
        params.height || 3,
        2,
        2
      );
      break;

    case 'torus':
      geom = new THREE.TorusGeometry(
        params.radius || 1.2,
        0.4,
        6,
        12
      );
      break;

    default:
      geom = new THREE.BoxGeometry(2, 2, 2);
  }

  return convertToNonIndexedFlatGeometry(geom, defaultColor);
}

/**
 * Extrudes selected face(s) outwards along normal
 */
export function extrudeFace(
  geometry: THREE.BufferGeometry,
  faceIndex: number,
  depth: number = 0.5
): THREE.BufferGeometry {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const colAttr = geometry.attributes.color as THREE.BufferAttribute;

  if (!posAttr) return geometry;

  const totalVertices = posAttr.count;
  const faceStartVertex = faceIndex * 3;
  if (faceStartVertex + 2 >= totalVertices) return geometry;

  // Extract vertices of the selected face (A, B, C)
  const vA = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex);
  const vB = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 1);
  const vC = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 2);

  // Calculate face normal
  const cb = new THREE.Vector3().subVectors(vC, vB);
  const ab = new THREE.Vector3().subVectors(vA, vB);
  const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();

  if (normal.lengthSq() < 0.0001) {
    normal.set(0, 1, 0);
  }

  // Get color of current face
  const colorA = new THREE.Color().fromBufferAttribute(colAttr, faceStartVertex);

  // New extruded positions for top face
  const vA_new = vA.clone().addScaledVector(normal, depth);
  const vB_new = vB.clone().addScaledVector(normal, depth);
  const vC_new = vC.clone().addScaledVector(normal, depth);

  // Build new geometry positions and colors arrays
  // Existing vertices + 3 top vertices + 3 side quads (6 vertices each = 18 vertices)
  const newPositions: number[] = [];
  const newColors: number[] = [];

  // Copy existing vertices EXCEPT replacing the target face with vA_new, vB_new, vC_new (top face)
  for (let i = 0; i < totalVertices; i++) {
    if (i === faceStartVertex) {
      newPositions.push(vA_new.x, vA_new.y, vA_new.z);
    } else if (i === faceStartVertex + 1) {
      newPositions.push(vB_new.x, vB_new.y, vB_new.z);
    } else if (i === faceStartVertex + 2) {
      newPositions.push(vC_new.x, vC_new.y, vC_new.z);
    } else {
      newPositions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    newColors.push(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
  }

  // Helper to append a triangle
  const addTriangle = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, col: THREE.Color) => {
    newPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
    for (let k = 0; k < 3; k++) {
      newColors.push(col.r, col.g, col.b);
    }
  };

  // Helper to append a side quad (2 triangles)
  const addQuad = (bottom1: THREE.Vector3, bottom2: THREE.Vector3, top2: THREE.Vector3, top1: THREE.Vector3) => {
    const sideColor = colorA.clone().multiplyScalar(0.9); // slightly darker for side accent
    addTriangle(bottom1, bottom2, top2, sideColor);
    addTriangle(bottom1, top2, top1, sideColor);
  };

  // Side 1: (vA, vB) to (vA_new, vB_new)
  addQuad(vA, vB, vB_new, vA_new);
  // Side 2: (vB, vC) to (vB_new, vC_new)
  addQuad(vB, vC, vC_new, vB_new);
  // Side 3: (vC, vA) to (vC_new, vA_new)
  addQuad(vC, vA, vA_new, vC_new);

  const newGeom = new THREE.BufferGeometry();
  newGeom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  newGeom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
  newGeom.computeVertexNormals();

  return newGeom;
}

/**
 * Inset face towards its centroid
 */
export function insetFace(
  geometry: THREE.BufferGeometry,
  faceIndex: number,
  insetAmount: number = 0.3
): THREE.BufferGeometry {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const colAttr = geometry.attributes.color as THREE.BufferAttribute;
  if (!posAttr) return geometry;

  const faceStartVertex = faceIndex * 3;
  if (faceStartVertex + 2 >= posAttr.count) return geometry;

  const vA = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex);
  const vB = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 1);
  const vC = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 2);

  const centroid = new THREE.Vector3()
    .add(vA).add(vB).add(vC).divideScalar(3);

  const scaleFactor = Math.max(0.05, 1 - insetAmount);
  const vA_inner = vA.clone().sub(centroid).multiplyScalar(scaleFactor).add(centroid);
  const vB_inner = vB.clone().sub(centroid).multiplyScalar(scaleFactor).add(centroid);
  const vC_inner = vC.clone().sub(centroid).multiplyScalar(scaleFactor).add(centroid);

  const faceColor = new THREE.Color().fromBufferAttribute(colAttr, faceStartVertex);

  const newPositions: number[] = [];
  const newColors: number[] = [];

  // Copy existing vertices replacing target face with inner face
  for (let i = 0; i < posAttr.count; i++) {
    if (i === faceStartVertex) {
      newPositions.push(vA_inner.x, vA_inner.y, vA_inner.z);
    } else if (i === faceStartVertex + 1) {
      newPositions.push(vB_inner.x, vB_inner.y, vB_inner.z);
    } else if (i === faceStartVertex + 2) {
      newPositions.push(vC_inner.x, vC_inner.y, vC_inner.z);
    } else {
      newPositions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    newColors.push(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
  }

  const addTri = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
    newPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
    for (let k = 0; k < 3; k++) {
      newColors.push(faceColor.r, faceColor.g, faceColor.b);
    }
  };

  // 3 outer triangles connecting inner face to outer boundary
  addTri(vA, vB, vB_inner);
  addTri(vA, vB_inner, vA_inner);

  addTri(vB, vC, vC_inner);
  addTri(vB, vC_inner, vB_inner);

  addTri(vC, vA, vA_inner);
  addTri(vC, vA_inner, vC_inner);

  const newGeom = new THREE.BufferGeometry();
  newGeom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  newGeom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
  newGeom.computeVertexNormals();

  return newGeom;
}

/**
 * Subdivides a face into 3 triangles centered at centroid
 */
export function subdivideFace(
  geometry: THREE.BufferGeometry,
  faceIndex: number
): THREE.BufferGeometry {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const colAttr = geometry.attributes.color as THREE.BufferAttribute;
  if (!posAttr) return geometry;

  const faceStartVertex = faceIndex * 3;
  if (faceStartVertex + 2 >= posAttr.count) return geometry;

  const vA = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex);
  const vB = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 1);
  const vC = new THREE.Vector3().fromBufferAttribute(posAttr, faceStartVertex + 2);

  const centroid = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
  const faceColor = new THREE.Color().fromBufferAttribute(colAttr, faceStartVertex);

  const newPositions: number[] = [];
  const newColors: number[] = [];

  for (let i = 0; i < posAttr.count; i++) {
    if (i !== faceStartVertex && i !== faceStartVertex + 1 && i !== faceStartVertex + 2) {
      newPositions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      newColors.push(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
    }
  }

  const addTri = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
    newPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
    for (let k = 0; k < 3; k++) {
      newColors.push(faceColor.r, faceColor.g, faceColor.b);
    }
  };

  addTri(vA, vB, centroid);
  addTri(vB, vC, centroid);
  addTri(vC, vA, centroid);

  const newGeom = new THREE.BufferGeometry();
  newGeom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  newGeom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
  newGeom.computeVertexNormals();

  return newGeom;
}

/**
 * Paints a specific face with a color hex string
 */
export function paintFaceColor(
  geometry: THREE.BufferGeometry,
  faceIndex: number,
  hexColor: string
): THREE.BufferGeometry {
  const colAttr = geometry.attributes.color as THREE.BufferAttribute;
  if (!colAttr) return geometry;

  const colorObj = new THREE.Color(hexColor);
  const faceStartVertex = faceIndex * 3;

  const clonedCol = colAttr.clone();
  for (let i = 0; i < 3; i++) {
    const idx = faceStartVertex + i;
    if (idx < clonedCol.count) {
      clonedCol.setXYZ(idx, colorObj.r, colorObj.g, colorObj.b);
    }
  }

  geometry.setAttribute('color', clonedCol);
  clonedCol.needsUpdate = true;
  return geometry;
}

/**
 * Move a specific vertex in local space
 */
export function moveVertex(
  geometry: THREE.BufferGeometry,
  vertexIndex: number,
  delta: THREE.Vector3
): void {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  if (!posAttr || vertexIndex >= posAttr.count) return;

  const currentX = posAttr.getX(vertexIndex);
  const currentY = posAttr.getY(vertexIndex);
  const currentZ = posAttr.getZ(vertexIndex);

  posAttr.setXYZ(vertexIndex, currentX + delta.x, currentY + delta.y, currentZ + delta.z);
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Welds vertices that are closer than threshold
 */
export function weldVertices(geometry: THREE.BufferGeometry, threshold: number = 0.05): THREE.BufferGeometry {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  if (!posAttr) return geometry;

  const uniquePositions: THREE.Vector3[] = [];
  const map: number[] = [];

  for (let i = 0; i < posAttr.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    let foundIdx = -1;

    for (let u = 0; u < uniquePositions.length; u++) {
      if (uniquePositions[u].distanceTo(v) <= threshold) {
        foundIdx = u;
        break;
      }
    }

    if (foundIdx >= 0) {
      map.push(foundIdx);
    } else {
      map.push(uniquePositions.length);
      uniquePositions.push(v);
    }
  }

  // Snap position attributes to mapped unique positions
  for (let i = 0; i < posAttr.count; i++) {
    const targetV = uniquePositions[map[i]];
    posAttr.setXYZ(i, targetV.x, targetV.y, targetV.z);
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Calculates Scene Poly Count & Memory Footprint in RAM
 */
export function calculateMemoryStats(scene: THREE.Scene): MemoryStats {
  let totalPoly = 0;
  let totalVerts = 0;
  let geometryBytes = 0;

  scene.traverse((obj) => {
    if (isUserMesh(obj) && obj.visible && obj.geometry) {
      const geom = obj.geometry as THREE.BufferGeometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        totalVerts += posAttr.count;
        totalPoly += Math.floor(posAttr.count / 3);
        // position: float32 (4 bytes * 3) + color: float32 (4 bytes * 3) + normal (4 * 3)
        geometryBytes += posAttr.count * (12 + 12 + 12);
      }
    }
  });

  const geometryMemoryKB = Math.round(geometryBytes / 1024);

  // Very lightweight estimation: Base engine ~ 60MB + scene objects & renderer overhead
  const estimatedRamMB = Math.round((60000 + geometryBytes / 1024 + totalPoly * 0.05) / 1024 * 10) / 10;

  return {
    geometryMemoryKB,
    totalPolyCount: totalPoly,
    totalVertexCount: totalVerts,
    estimatedRamMB: Math.min(500, Math.max(25, estimatedRamMB))
  };
}

/**
 * Exports current scene or mesh to GLTF/GLB download
 */
export function exportToGLTF(scene: THREE.Scene, filename: string = 'lowpoly_model') {
  const exporter = new GLTFExporter();
  
  // Filter scene to export only user meshes
  const exportGroup = new THREE.Group();
  scene.traverse((child) => {
    if (isUserMesh(child)) {
      exportGroup.add(child.clone());
    }
  });

  exporter.parse(
    exportGroup,
    (gltf) => {
      const output = JSON.stringify(gltf, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.gltf`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    (error) => {
      console.error('Error exporting GLTF:', error);
    },
    { binary: false }
  );
}

/**
 * Exports current scene or mesh to OBJ format
 */
export function exportToOBJ(scene: THREE.Scene, filename: string = 'lowpoly_model') {
  const exporter = new OBJExporter();
  
  const exportGroup = new THREE.Group();
  scene.traverse((child) => {
    if (isUserMesh(child)) {
      exportGroup.add(child.clone());
    }
  });

  const result = exporter.parse(exportGroup);
  const blob = new Blob([result], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.obj`;
  link.click();
  URL.revokeObjectURL(link.href);
}
