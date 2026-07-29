export type EditMode = 'object' | 'vertex' | 'face' | 'edge';

export type ToolType = 'select' | 'translate' | 'rotate' | 'scale' | 'extrude' | 'inset' | 'subdivide' | 'paint' | 'delete';

export type PrimitiveType = 'cube' | 'cylinder' | 'sphere' | 'cone' | 'plane' | 'torus' | 'pyramid';

export interface LowPolyColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface EditableMeshNode {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  wireframe: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  vertexCount: number;
  faceCount: number;
}

export interface PrimitiveParams {
  type: PrimitiveType;
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;
  radialSegments?: number;
}

export interface MemoryStats {
  geometryMemoryKB: number;
  totalPolyCount: number;
  totalVertexCount: number;
  estimatedRamMB: number;
}

export interface ModelSample {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  polyCount: number;
}
