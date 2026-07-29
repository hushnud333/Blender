import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EditMode, ToolType } from '../types';
import { moveVertex, extrudeFace, insetFace, subdivideFace, paintFaceColor, convertToNonIndexedFlatGeometry, isUserMesh } from '../utils/meshUtils';
import { Target, Focus } from 'lucide-react';

interface ThreeCanvasProps {
  scene: THREE.Scene;
  activeMeshId: string | null;
  editMode: EditMode;
  activeTool: ToolType;
  selectedColor: string;
  extrudeDepth: number;
  insetRatio: number;
  snapToGrid: boolean;
  gridSize: number;
  wireframeMode: boolean;
  showGrid: boolean;
  showShadows: boolean;
  ambientLightOn: boolean;
  ambientIntensity: number;
  directionalLightOn: boolean;
  directionalIntensity: number;
  fillLightOn: boolean;
  fillIntensity: number;
  onMeshSelect: (meshId: string | null) => void;
  onGeometryChange: () => void;
  onVertexSelect: (vertexIndex: number | null) => void;
  onFaceSelect: (faceIndex: number | null) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  scene,
  activeMeshId,
  editMode,
  activeTool,
  selectedColor,
  extrudeDepth,
  insetRatio,
  snapToGrid,
  gridSize,
  wireframeMode,
  showGrid,
  showShadows,
  ambientLightOn,
  ambientIntensity,
  directionalLightOn,
  directionalIntensity,
  fillLightOn,
  fillIntensity,
  onMeshSelect,
  onGeometryChange,
  onVertexSelect,
  onFaceSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Selection states inside canvas
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);

  // Vertex handle points visualization
  const vertexPointsRef = useRef<THREE.Points | null>(null);

  // Face highlight overlay mesh
  const faceHighlightMeshRef = useRef<THREE.Mesh | null>(null);

  // Raycasting
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Set up Three.js Renderer, Camera, Lights, and Controls
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Renderer setup with optimized low-memory config
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = showShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 5, 7);
    cameraRef.current = camera;

    // Orbit Controls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.maxPolarAngle = Math.PI / 2 + 0.1;
    orbit.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    orbitControlsRef.current = orbit;

    // Grid Helper
    const grid = new THREE.GridHelper(20, 20, 0x3b82f6, 0x334155);
    grid.position.y = 0;
    grid.name = 'GridHelper';
    scene.add(grid);
    gridHelperRef.current = grid;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight.name = 'AmbientLight';
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.name = 'DirLight';
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    fillLight.position.set(-6, 4, -6);
    fillLight.name = 'FillLight';
    scene.add(fillLight);

    // Transform Controls for 3D manipulation
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.75;
    const transformHelper = transformControls.getHelper();
    transformHelper.name = 'TransformControls';
    scene.add(transformHelper);

    transformControls.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
    });

    transformControls.addEventListener('change', () => {
      if (transformControls.object) {
        onGeometryChange();
      }
    });

    transformControlsRef.current = transformControls;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer for dynamic canvas container layout
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      transformControls.dispose();
      orbit.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Shadows & Grid Visibility
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.shadowMap.enabled = showShadows;
    }
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid, showShadows]);

  // Sync Active Mesh & Selection
  useEffect(() => {
    if (!transformControlsRef.current) return;

    if (!activeMeshId || editMode !== 'object') {
      transformControlsRef.current.detach();
      return;
    }

    const targetMesh = scene.getObjectById(Number(activeMeshId)) || scene.getObjectByProperty('uuid', activeMeshId);
    if (targetMesh && targetMesh instanceof THREE.Mesh) {
      transformControlsRef.current.attach(targetMesh);
    } else {
      transformControlsRef.current.detach();
    }
  }, [activeMeshId, editMode, scene]);

  // Update Transform Tool Mode (Translate/Rotate/Scale)
  useEffect(() => {
    if (!transformControlsRef.current) return;

    if (activeTool === 'translate') {
      transformControlsRef.current.setMode('translate');
    } else if (activeTool === 'rotate') {
      transformControlsRef.current.setMode('rotate');
    } else if (activeTool === 'scale') {
      transformControlsRef.current.setMode('scale');
    }

    if (snapToGrid) {
      transformControlsRef.current.setTranslationSnap(gridSize);
      transformControlsRef.current.setRotationSnap(THREE.MathUtils.degToRad(15));
      transformControlsRef.current.setScaleSnap(gridSize);
    } else {
      transformControlsRef.current.setTranslationSnap(null);
      transformControlsRef.current.setRotationSnap(null);
      transformControlsRef.current.setScaleSnap(null);
    }
  }, [activeTool, snapToGrid, gridSize]);

  // Focus / Frame camera on active mesh or entire scene
  const focusCamera = useCallback(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;

    let targetObj: THREE.Object3D | null = null;
    if (activeMeshId) {
      targetObj = scene.getObjectByProperty('uuid', activeMeshId) || null;
    }

    const box = new THREE.Box3();
    if (targetObj) {
      box.setFromObject(targetObj);
    } else {
      let count = 0;
      scene.traverse((child) => {
        if (isUserMesh(child) && child.visible) {
          if (count === 0) {
            box.setFromObject(child);
          } else {
            box.expandByObject(child);
          }
          count++;
        }
      });
      if (count === 0) {
        box.setFromCenterAndSize(new THREE.Vector3(0, 1, 0), new THREE.Vector3(2, 2, 2));
      }
    }

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 1.5);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.25;
    cameraDistance = Math.max(cameraDistance, 3.5);

    const direction = new THREE.Vector3(1, 0.8, 1.2).normalize();
    const newCamPos = center.clone().addScaledVector(direction, cameraDistance);

    cameraRef.current.position.copy(newCamPos);
    orbitControlsRef.current.target.copy(center);
    orbitControlsRef.current.update();
  }, [activeMeshId, scene]);

  // Dynamic Scene Lighting updates
  useEffect(() => {
    const ambientLight = scene.getObjectByName('AmbientLight') as THREE.AmbientLight;
    if (ambientLight) {
      ambientLight.visible = ambientLightOn;
      ambientLight.intensity = ambientIntensity;
    }

    const dirLight = scene.getObjectByName('DirLight') as THREE.DirectionalLight;
    if (dirLight) {
      dirLight.visible = directionalLightOn;
      dirLight.intensity = directionalIntensity;
    }

    const fillLight = scene.getObjectByName('FillLight') as THREE.DirectionalLight;
    if (fillLight) {
      fillLight.visible = fillLightOn;
      fillLight.intensity = fillIntensity;
    }
  }, [scene, ambientLightOn, ambientIntensity, directionalLightOn, directionalIntensity, fillLightOn, fillIntensity]);

  // Keyboard shortcut listener for Focus ('f')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key.toLowerCase() === 'f') {
        focusCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusCamera]);

  // Update Wireframe mode on scene meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (isUserMesh(child)) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = wireframeMode;
          });
        } else if (child.material && 'wireframe' in child.material) {
          (child.material as THREE.MeshStandardMaterial).wireframe = wireframeMode;
        }
      }
    });
  }, [wireframeMode, scene]);

  // Render Vertex handles visualization when in Vertex mode
  useEffect(() => {
    if (editMode !== 'vertex' || !activeMeshId) {
      if (vertexPointsRef.current) {
        scene.remove(vertexPointsRef.current);
        vertexPointsRef.current.geometry.dispose();
        vertexPointsRef.current = null;
      }
      return;
    }

    const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
    if (!mesh || !mesh.geometry) return;

    const posAttr = mesh.geometry.attributes.position;
    if (!posAttr) return;

    // Create points geometry in world space
    const worldPositions: number[] = [];
    const worldMatrix = mesh.matrixWorld;

    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i).applyMatrix4(worldMatrix);
      worldPositions.push(v.x, v.y, v.z);
    }

    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(worldPositions, 3));

    const pointsMat = new THREE.PointsMaterial({
      color: 0x38bdf8, // Cyan vertex dot
      size: 10,
      sizeAttenuation: false
    });

    if (vertexPointsRef.current) {
      scene.remove(vertexPointsRef.current);
      vertexPointsRef.current.geometry.dispose();
    }

    const pointsMesh = new THREE.Points(pointsGeom, pointsMat);
    pointsMesh.name = 'VertexHandles';
    scene.add(pointsMesh);
    vertexPointsRef.current = pointsMesh;

    return () => {
      if (vertexPointsRef.current) {
        scene.remove(vertexPointsRef.current);
        vertexPointsRef.current.geometry.dispose();
        vertexPointsRef.current = null;
      }
    };
  }, [editMode, activeMeshId, scene, onGeometryChange]);

  // Update Face Overlay Highlight
  useEffect(() => {
    if (editMode !== 'face' || selectedFaceIndex === null || !activeMeshId) {
      if (faceHighlightMeshRef.current) {
        scene.remove(faceHighlightMeshRef.current);
        faceHighlightMeshRef.current.geometry.dispose();
        faceHighlightMeshRef.current = null;
      }
      return;
    }

    const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
    if (!mesh || !mesh.geometry) return;

    const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const faceStart = selectedFaceIndex * 3;
    if (faceStart + 2 >= posAttr.count) return;

    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, faceStart).applyMatrix4(mesh.matrixWorld);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, faceStart + 1).applyMatrix4(mesh.matrixWorld);
    const vC = new THREE.Vector3().fromBufferAttribute(posAttr, faceStart + 2).applyMatrix4(mesh.matrixWorld);

    const highlightGeom = new THREE.BufferGeometry();
    highlightGeom.setAttribute('position', new THREE.Float32BufferAttribute([
      vA.x, vA.y, vA.z,
      vB.x, vB.y, vB.z,
      vC.x, vC.y, vC.z
    ], 3));
    highlightGeom.computeVertexNormals();

    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber highlight overlay
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthTest: false
    });

    if (faceHighlightMeshRef.current) {
      scene.remove(faceHighlightMeshRef.current);
      faceHighlightMeshRef.current.geometry.dispose();
    }

    const highlightMesh = new THREE.Mesh(highlightGeom, highlightMat);
    highlightMesh.name = 'FaceHighlight';
    scene.add(highlightMesh);
    faceHighlightMeshRef.current = highlightMesh;
  }, [editMode, selectedFaceIndex, activeMeshId, scene, onGeometryChange]);

  // Handle Raycasting Pointer Clicks for Picking
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current) return;

    // Only pick on primary left click
    if (e.button !== 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    if (editMode === 'object') {
      // Pick mesh object
      const meshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (isUserMesh(child) && child.visible) {
          meshes.push(child);
        }
      });

      const intersects = raycasterRef.current.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        onMeshSelect(hitMesh.uuid);
      } else {
        // Clicked background empty space
        onMeshSelect(null);
      }
    } else if (editMode === 'vertex' && activeMeshId) {
      // Pick closest vertex handle point
      const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
      if (!mesh || !vertexPointsRef.current) return;

      const intersects = raycasterRef.current.intersectObject(vertexPointsRef.current, false);
      if (intersects.length > 0 && intersects[0].index !== undefined) {
        const vIdx = intersects[0].index;
        setSelectedVertexIndex(vIdx);
        onVertexSelect(vIdx);
      } else {
        setSelectedVertexIndex(null);
        onVertexSelect(null);
      }
    } else if ((editMode === 'face' || activeTool === 'paint') && activeMeshId) {
      // Pick face
      const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
      if (!mesh) return;

      const intersects = raycasterRef.current.intersectObject(mesh, false);
      if (intersects.length > 0 && intersects[0].faceIndex !== undefined) {
        const faceIdx = intersects[0].faceIndex;
        setSelectedFaceIndex(faceIdx);
        onFaceSelect(faceIdx);

        // Perform face tool action immediately if active tool is paint, extrude, or inset
        if (activeTool === 'paint') {
          mesh.geometry = paintFaceColor(mesh.geometry, faceIdx, selectedColor);
          onGeometryChange();
        } else if (activeTool === 'extrude') {
          mesh.geometry = extrudeFace(mesh.geometry, faceIdx, extrudeDepth);
          onGeometryChange();
        } else if (activeTool === 'inset') {
          mesh.geometry = insetFace(mesh.geometry, faceIdx, insetRatio);
          onGeometryChange();
        } else if (activeTool === 'subdivide') {
          mesh.geometry = subdivideFace(mesh.geometry, faceIdx);
          onGeometryChange();
        }
      }
    }
  }, [editMode, activeTool, activeMeshId, scene, selectedColor, extrudeDepth, insetRatio, onMeshSelect, onVertexSelect, onFaceSelect, onGeometryChange]);

  // Preset Camera View Functions
  const setCameraView = (view: 'top' | 'front' | 'side' | 'iso') => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    const cam = cameraRef.current;
    const target = orbitControlsRef.current.target;

    switch (view) {
      case 'top':
        cam.position.set(target.x, target.y + 10, target.z + 0.001);
        break;
      case 'front':
        cam.position.set(target.x, target.y, target.z + 10);
        break;
      case 'side':
        cam.position.set(target.x + 10, target.y, target.z);
        break;
      case 'iso':
        cam.position.set(target.x + 6, target.y + 6, target.z + 6);
        break;
    }
    orbitControlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* WebGL Canvas Render Target */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
      />

      {/* Viewport Overlay Controls (Top-Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#0f0f12]/80 backdrop-blur-md p-1.5 rounded-lg border border-[#1f1f23] text-xs font-mono shadow-xl z-10">
        <button
          onClick={focusCamera}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-medium transition"
          title="Focus / Frame Camera (Hotkey: F)"
        >
          <Target className="w-3.5 h-3.5" />
          Focus
        </button>

        <div className="w-[1px] h-4 bg-[#27272a] mx-0.5" />

        <button
          onClick={() => setCameraView('top')}
          className="px-2 py-1 rounded hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white transition"
          title="Top View"
        >
          Top
        </button>
        <button
          onClick={() => setCameraView('front')}
          className="px-2 py-1 rounded hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white transition"
          title="Front View"
        >
          Front
        </button>
        <button
          onClick={() => setCameraView('side')}
          className="px-2 py-1 rounded hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white transition"
          title="Side View"
        >
          Side
        </button>
        <button
          onClick={() => setCameraView('iso')}
          className="px-2 py-1 rounded hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white transition"
          title="Isometric View"
        >
          Iso
        </button>
      </div>

      {/* Mode / Tool Active Indicator (Top-Left overlay) */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0f0f12]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1f1f23] text-xs font-medium z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[#8e8e93] capitalize">{editMode} Mode</span>
        <span className="text-[#3f3f46]">|</span>
        <span className="text-indigo-400 capitalize">{activeTool} Tool</span>
        {selectedFaceIndex !== null && editMode === 'face' && (
          <span className="text-amber-400 font-mono">Face #{selectedFaceIndex}</span>
        )}
        {selectedVertexIndex !== null && editMode === 'vertex' && (
          <span className="text-sky-400 font-mono">Vert #{selectedVertexIndex}</span>
        )}
      </div>
    </div>
  );
};
