import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { 
  EditMode, 
  ToolType, 
  PrimitiveType, 
  EditableMeshNode, 
  MemoryStats 
} from './types';
import { 
  createPrimitiveGeometry, 
  weldVertices, 
  calculateMemoryStats, 
  exportToGLTF, 
  exportToOBJ,
  paintFaceColor,
  convertToNonIndexedFlatGeometry,
  isUserMesh,
  clearUserObjectsFromScene
} from './utils/meshUtils';
import { buildSampleModel } from './utils/sampleModels';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderBar } from './components/HeaderBar';
import { LeftToolbar } from './components/LeftToolbar';
import { RightSidebar } from './components/RightSidebar';
import { SampleModelsModal } from './components/SampleModelsModal';

export default function App() {
  // Main Three.js Scene persistent reference
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());

  // App Editing State
  const [nodes, setNodes] = useState<EditableMeshNode[]>([]);
  const [activeMeshId, setActiveMeshId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('object');
  const [activeTool, setActiveTool] = useState<ToolType>('translate');

  // Tool Parameters
  const [extrudeDepth, setExtrudeDepth] = useState<number>(0.5);
  const [insetRatio, setInsetRatio] = useState<number>(0.3);
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(0.5);

  // Viewport & Lighting Settings
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);

  // Dynamic Scene Lighting States
  const [ambientLightOn, setAmbientLightOn] = useState<boolean>(true);
  const [ambientIntensity, setAmbientIntensity] = useState<number>(0.9);
  const [directionalLightOn, setDirectionalLightOn] = useState<boolean>(true);
  const [directionalIntensity, setDirectionalIntensity] = useState<number>(1.3);
  const [fillLightOn, setFillLightOn] = useState<boolean>(true);
  const [fillIntensity, setFillIntensity] = useState<number>(0.6);

  // Sidebar Collapse States (for mobile phones and smaller screens)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);

  // Memory & Stats State
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    geometryMemoryKB: 0,
    totalPolyCount: 0,
    totalVertexCount: 0,
    estimatedRamMB: 48
  });

  // UI Modal States
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);

  // Undo / Redo History Stack (storing serializable state snapshots)
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Helper to sync UI nodes array with actual Three.js Scene objects
  const syncSceneNodes = useCallback(() => {
    const scene = sceneRef.current;
    const meshNodes: EditableMeshNode[] = [];

    scene.traverse((child) => {
      if (isUserMesh(child)) {
        const geom = child.geometry as THREE.BufferGeometry;
        const posAttr = geom ? geom.attributes.position : null;
        const faceCount = posAttr ? Math.floor(posAttr.count / 3) : 0;
        const vertexCount = posAttr ? posAttr.count : 0;

        meshNodes.push({
          id: child.uuid,
          name: child.name || `LowPoly_Mesh_${meshNodes.length + 1}`,
          visible: child.visible,
          locked: child.userData.locked || false,
          color: child.userData.defaultColor || '#3b82f6',
          wireframe: wireframeMode,
          position: [child.position.x, child.position.y, child.position.z],
          rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
          scale: [child.scale.x, child.scale.y, child.scale.z],
          vertexCount,
          faceCount
        });
      }
    });

    setNodes(meshNodes);

    // Update Memory & RAM Statistics
    const stats = calculateMemoryStats(scene);
    setMemoryStats(stats);
  }, [wireframeMode]);

  // Save State Snapshot for Undo/Redo
  const saveSnapshot = useCallback(() => {
    const scene = sceneRef.current;
    const snapshot: any[] = [];

    scene.traverse((child) => {
      if (isUserMesh(child)) {
        const geom = child.geometry as THREE.BufferGeometry;
        const posAttr = geom ? (geom.attributes.position as THREE.BufferAttribute) : null;
        const colAttr = geom ? (geom.attributes.color as THREE.BufferAttribute) : null;

        snapshot.push({
          uuid: child.uuid,
          name: child.name,
          visible: child.visible,
          position: child.position.toArray(),
          rotation: child.rotation.toArray(),
          scale: child.scale.toArray(),
          positions: Array.from(posAttr ? posAttr.array : []),
          colors: Array.from(colAttr ? colAttr.array : [])
        });
      }
    });

    const serialized = JSON.stringify(snapshot);

    // Truncate redo history
    const newStack = historyStackRef.current.slice(0, historyIndexRef.current + 1);
    newStack.push(serialized);

    // Limit stack size to save RAM memory footprint
    if (newStack.length > 20) {
      newStack.shift();
    }

    historyStackRef.current = newStack;
    historyIndexRef.current = newStack.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Initialize Default Starter Cube Scene
  useEffect(() => {
    const scene = sceneRef.current;
    scene.clear();

    const cubeGeom = createPrimitiveGeometry({ type: 'cube', width: 2, height: 2, depth: 2 }, '#3b82f6');
    const cubeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.5,
      metalness: 0.1,
      flatShading: true
    });

    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
    cubeMesh.name = 'Starter_Cube';
    cubeMesh.position.set(0, 1, 0);
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    cubeMesh.userData.defaultColor = '#3b82f6';

    scene.add(cubeMesh);
    setActiveMeshId(cubeMesh.uuid);

    syncSceneNodes();
    saveSnapshot();
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === '1') setEditMode('object');
      if (e.key === '2') setEditMode('vertex');
      if (e.key === '3') setEditMode('face');

      if (e.key === 'g' || e.key === 'G') setActiveTool('translate');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rotate');
      if (e.key === 's' || e.key === 'S') setActiveTool('scale');
      if (e.key === 'e' || e.key === 'E') setActiveTool('extrude');
      if (e.key === 'p' || e.key === 'P') setActiveTool('paint');

      if (e.key === 'z' || e.key === 'Z') {
        if (!e.ctrlKey && !e.metaKey) {
          setWireframeMode((prev) => !prev);
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeMeshId && editMode === 'object') {
          handleDeleteNode(activeMeshId);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMeshId, editMode]);

  // Action: Add Primitive Object
  const handleAddPrimitive = (type: PrimitiveType) => {
    const scene = sceneRef.current;
    const geom = createPrimitiveGeometry({ type }, selectedColor);

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.5,
      metalness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    });

    const mesh = new THREE.Mesh(geom, mat);
    const count = nodes.length + 1;
    mesh.name = `LowPoly_${type.charAt(0).toUpperCase() + type.slice(1)}_${count}`;
    mesh.position.set((Math.random() - 0.5) * 3, 1, (Math.random() - 0.5) * 3);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.defaultColor = selectedColor;

    scene.add(mesh);
    setActiveMeshId(mesh.uuid);
    syncSceneNodes();
    saveSnapshot();
  };

  // Action: Load Sample Model Preset
  const handleLoadSample = (id: string) => {
    const scene = sceneRef.current;
    clearUserObjectsFromScene(scene);

    const modelGroup = buildSampleModel(id);
    scene.add(modelGroup);

    // Pick first mesh inside model group
    let firstMeshUuid: string | null = null;
    modelGroup.traverse((child) => {
      if (isUserMesh(child) && !firstMeshUuid) {
        firstMeshUuid = child.uuid;
      }
    });

    setActiveMeshId(firstMeshUuid);
    syncSceneNodes();
    saveSnapshot();
  };

  // Action: Delete Mesh Node
  const handleDeleteNode = (id: string) => {
    const scene = sceneRef.current;
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj) {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
      if (activeMeshId === id) {
        setActiveMeshId(null);
      }
      syncSceneNodes();
      saveSnapshot();
    }
  };

  // Action: Duplicate Node
  const handleDuplicateNode = (id: string) => {
    const scene = sceneRef.current;
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj && obj instanceof THREE.Mesh) {
      const clonedMesh = obj.clone();
      clonedMesh.position.x += 0.8;
      clonedMesh.position.z += 0.8;
      clonedMesh.name = `${obj.name}_Copy`;
      scene.add(clonedMesh);
      setActiveMeshId(clonedMesh.uuid);
      syncSceneNodes();
      saveSnapshot();
    }
  };

  // Action: Toggle Visibility & Lock
  const handleToggleNodeVisibility = (id: string) => {
    const scene = sceneRef.current;
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj) {
      obj.visible = !obj.visible;
      syncSceneNodes();
    }
  };

  const handleToggleNodeLock = (id: string) => {
    const scene = sceneRef.current;
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj) {
      obj.userData.locked = !obj.userData.locked;
      syncSceneNodes();
    }
  };

  // Action: Update Transform
  const handleUpdateTransform = (
    id: string,
    pos: [number, number, number],
    rot: [number, number, number],
    scale: [number, number, number]
  ) => {
    const scene = sceneRef.current;
    const obj = scene.getObjectByProperty('uuid', id);
    if (obj) {
      obj.position.set(pos[0], pos[1], pos[2]);
      obj.rotation.set(rot[0], rot[1], rot[2]);
      obj.scale.set(scale[0], scale[1], scale[2]);
      syncSceneNodes();
    }
  };

  // Action: Weld Vertices
  const handleWeldVertices = () => {
    if (!activeMeshId) return;
    const scene = sceneRef.current;
    const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
    if (mesh && mesh.geometry) {
      mesh.geometry = weldVertices(mesh.geometry, 0.08);
      syncSceneNodes();
      saveSnapshot();
    }
  };

  // Action: Apply Color to Whole Mesh
  const handleApplyColorToWholeMesh = () => {
    if (!activeMeshId) return;
    const scene = sceneRef.current;
    const mesh = scene.getObjectByProperty('uuid', activeMeshId) as THREE.Mesh;
    if (mesh && mesh.geometry) {
      const geom = mesh.geometry as THREE.BufferGeometry;
      const posAttr = geom.attributes.position;
      if (posAttr) {
        const faceCount = Math.floor(posAttr.count / 3);
        let updatedGeom = geom;
        for (let f = 0; f < faceCount; f++) {
          updatedGeom = paintFaceColor(updatedGeom, f, selectedColor);
        }
        mesh.geometry = updatedGeom;
        mesh.userData.defaultColor = selectedColor;
        syncSceneNodes();
        saveSnapshot();
      }
    }
  };

  // Action: Clear Scene
  const handleNewScene = () => {
    const scene = sceneRef.current;
    clearUserObjectsFromScene(scene);
    setActiveMeshId(null);
    syncSceneNodes();
    saveSnapshot();
  };

  // Action: Export GLTF / OBJ
  const handleExportGLTF = () => {
    exportToGLTF(sceneRef.current, 'lowpoly_3d_asset');
  };

  const handleExportOBJ = () => {
    exportToOBJ(sceneRef.current, 'lowpoly_3d_asset');
  };

  // Action: Save / Load Project JSON
  const handleSaveProject = () => {
    const scene = sceneRef.current;
    const data: any[] = [];
    scene.traverse((child) => {
      if (isUserMesh(child)) {
        const posAttr = child.geometry?.attributes?.position;
        const colAttr = child.geometry?.attributes?.color;
        data.push({
          name: child.name,
          position: child.position.toArray(),
          rotation: child.rotation.toArray(),
          scale: child.scale.toArray(),
          positions: Array.from(posAttr ? posAttr.array : []),
          colors: Array.from(colAttr ? colAttr.array : [])
        });
      }
    });

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lowpoly_project.json';
    link.click();
  };

  const handleLoadProject = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const scene = sceneRef.current;
      handleNewScene();

      data.forEach((item: any) => {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(item.positions, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(item.colors, 3));
        geom.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.5,
          metalness: 0.1,
          flatShading: true,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = item.name || 'Loaded_Mesh';
        mesh.position.fromArray(item.position);
        mesh.rotation.fromArray(item.rotation);
        mesh.scale.fromArray(item.scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
      });

      syncSceneNodes();
      saveSnapshot();
    } catch (err) {
      console.error('Failed to parse project JSON:', err);
    }
  };

  // Action: Import GLTF/OBJ File
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    const scene = sceneRef.current;

    if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        if (!e.target?.result) return;
        const loader = new GLTFLoader();
        loader.parse(e.target.result as ArrayBuffer, '', (gltf) => {
          const importedScene = gltf.scene;

          importedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              if (child.geometry) {
                let meshColor = '#94a3b8';
                if (child.material && !Array.isArray(child.material)) {
                  const mat = child.material as THREE.MeshStandardMaterial;
                  if (mat.color) {
                    meshColor = '#' + mat.color.getHexString();
                  }
                }
                child.geometry = convertToNonIndexedFlatGeometry(child.geometry, meshColor);
                child.material = new THREE.MeshStandardMaterial({
                  vertexColors: true,
                  roughness: 0.5,
                  metalness: 0.1,
                  flatShading: true,
                  side: THREE.DoubleSide,
                  wireframe: wireframeMode
                });
                child.userData.defaultColor = meshColor;
              }
            }
          });

          // Normalize bounding box & fit to unit space centered at grid
          const box = new THREE.Box3().setFromObject(importedScene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);

          if (maxDim > 0) {
            const scale = 3 / maxDim;
            importedScene.scale.set(scale, scale, scale);

            const scaledBox = new THREE.Box3().setFromObject(importedScene);
            const center = new THREE.Vector3();
            scaledBox.getCenter(center);

            importedScene.position.x -= center.x;
            importedScene.position.y -= scaledBox.min.y;
            importedScene.position.z -= center.z;
          }

          importedScene.name = file.name.replace(/\.[^/.]+$/, "");
          scene.add(importedScene);

          let firstMeshUuid: string | null = null;
          importedScene.traverse((child) => {
            if (isUserMesh(child) && !firstMeshUuid) {
              firstMeshUuid = child.uuid;
            }
          });

          setActiveMeshId(firstMeshUuid);
          syncSceneNodes();
          saveSnapshot();
        });
      };
    } else if (file.name.endsWith('.obj')) {
      reader.readAsText(file);
      reader.onload = (e) => {
        if (!e.target?.result) return;
        const loader = new OBJLoader();
        const objGroup = loader.parse(e.target.result as string);

        objGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.geometry) {
              child.geometry = convertToNonIndexedFlatGeometry(child.geometry, '#3b82f6');
              child.material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.5,
                metalness: 0.1,
                flatShading: true,
                side: THREE.DoubleSide,
                wireframe: wireframeMode
              });
              child.userData.defaultColor = '#3b82f6';
            }
          }
        });

        // Normalize bounding box & fit to unit space centered at grid
        const box = new THREE.Box3().setFromObject(objGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        if (maxDim > 0) {
          const scale = 3 / maxDim;
          objGroup.scale.set(scale, scale, scale);

          const scaledBox = new THREE.Box3().setFromObject(objGroup);
          const center = new THREE.Vector3();
          scaledBox.getCenter(center);

          objGroup.position.x -= center.x;
          objGroup.position.y -= scaledBox.min.y;
          objGroup.position.z -= center.z;
        }

        objGroup.name = file.name.replace(/\.[^/.]+$/, "");
        scene.add(objGroup);

        let firstMeshUuid: string | null = null;
        objGroup.traverse((child) => {
          if (isUserMesh(child) && !firstMeshUuid) {
            firstMeshUuid = child.uuid;
          }
        });

        setActiveMeshId(firstMeshUuid);
        syncSceneNodes();
        saveSnapshot();
      };
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const snapshot = JSON.parse(historyStackRef.current[historyIndexRef.current]);
      applySnapshot(snapshot);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndexRef.current < historyStackRef.current.length - 1) {
      historyIndexRef.current += 1;
      const snapshot = JSON.parse(historyStackRef.current[historyIndexRef.current]);
      applySnapshot(snapshot);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
    }
  };

  const applySnapshot = (snapshot: any[]) => {
    const scene = sceneRef.current;
    clearUserObjectsFromScene(scene);

    snapshot.forEach((item) => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(item.positions, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(item.colors, 3));
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.5,
        flatShading: true,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.uuid = item.uuid;
      mesh.name = item.name;
      mesh.position.fromArray(item.position);
      mesh.rotation.fromArray(item.rotation);
      mesh.scale.fromArray(item.scale);
      mesh.visible = item.visible;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
    });

    syncSceneNodes();
  };

  // Lighting Presets Handler
  const handleApplyLightingPreset = (preset: 'studio' | 'bright' | 'soft' | 'dramatic') => {
    if (preset === 'bright') {
      setAmbientLightOn(true);
      setAmbientIntensity(1.6);
      setDirectionalLightOn(true);
      setDirectionalIntensity(2.0);
      setFillLightOn(true);
      setFillIntensity(1.0);
    } else if (preset === 'studio') {
      setAmbientLightOn(true);
      setAmbientIntensity(0.9);
      setDirectionalLightOn(true);
      setDirectionalIntensity(1.3);
      setFillLightOn(true);
      setFillIntensity(0.6);
    } else if (preset === 'soft') {
      setAmbientLightOn(true);
      setAmbientIntensity(1.4);
      setDirectionalLightOn(true);
      setDirectionalIntensity(0.6);
      setFillLightOn(true);
      setFillIntensity(0.8);
    } else if (preset === 'dramatic') {
      setAmbientLightOn(true);
      setAmbientIntensity(0.3);
      setDirectionalLightOn(true);
      setDirectionalIntensity(2.2);
      setFillLightOn(true);
      setFillIntensity(0.2);
    }
  };

  // Dark Models Brighten Boost
  const handleBrightenDarkModels = () => {
    setAmbientLightOn(true);
    setAmbientIntensity(1.8);
    setDirectionalLightOn(true);
    setDirectionalIntensity(2.2);
    setFillLightOn(true);
    setFillIntensity(1.0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] font-sans antialiased overflow-hidden">
      {/* Header Bar */}
      <HeaderBar
        memoryStats={memoryStats}
        wireframeMode={wireframeMode}
        showGrid={showGrid}
        showShadows={showShadows}
        canUndo={canUndo}
        canRedo={canRedo}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen((prev) => !prev)}
        onToggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
        onBrightenDarkModels={handleBrightenDarkModels}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleWireframe={() => setWireframeMode((prev) => !prev)}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onToggleShadows={() => setShowShadows((prev) => !prev)}
        onNewScene={handleNewScene}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onExportGLTF={handleExportGLTF}
        onExportOBJ={handleExportOBJ}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onImportFile={handleImportFile}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Tools Bar */}
        {leftSidebarOpen && (
          <LeftToolbar
            editMode={editMode}
            activeTool={activeTool}
            onSelectEditMode={setEditMode}
            onSelectTool={setActiveTool}
            onAddPrimitive={handleAddPrimitive}
            onWeldVertices={handleWeldVertices}
            onDeleteSelected={() => activeMeshId && handleDeleteNode(activeMeshId)}
          />
        )}

        {/* Center 3D Three.js Viewport */}
        <main className="flex-1 h-full relative">
          <ThreeCanvas
            scene={sceneRef.current}
            activeMeshId={activeMeshId}
            editMode={editMode}
            activeTool={activeTool}
            selectedColor={selectedColor}
            extrudeDepth={extrudeDepth}
            insetRatio={insetRatio}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            wireframeMode={wireframeMode}
            showGrid={showGrid}
            showShadows={showShadows}
            ambientLightOn={ambientLightOn}
            ambientIntensity={ambientIntensity}
            directionalLightOn={directionalLightOn}
            directionalIntensity={directionalIntensity}
            fillLightOn={fillLightOn}
            fillIntensity={fillIntensity}
            onMeshSelect={setActiveMeshId}
            onGeometryChange={() => {
              syncSceneNodes();
              saveSnapshot();
            }}
            onVertexSelect={(vIdx) => {}}
            onFaceSelect={(fIdx) => {}}
          />
        </main>

        {/* Right Properties & Scene Outliner Sidebar */}
        {rightSidebarOpen && (
          <RightSidebar
            nodes={nodes}
            activeMeshId={activeMeshId}
            extrudeDepth={extrudeDepth}
            insetRatio={insetRatio}
            selectedColor={selectedColor}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            ambientLightOn={ambientLightOn}
            ambientIntensity={ambientIntensity}
            directionalLightOn={directionalLightOn}
            directionalIntensity={directionalIntensity}
            fillLightOn={fillLightOn}
            fillIntensity={fillIntensity}
            onSelectNode={setActiveMeshId}
            onToggleNodeVisibility={handleToggleNodeVisibility}
            onToggleNodeLock={handleToggleNodeLock}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
            onUpdateTransform={handleUpdateTransform}
            onChangeExtrudeDepth={setExtrudeDepth}
            onChangeInsetRatio={setInsetRatio}
            onChangeColor={setSelectedColor}
            onToggleSnapToGrid={() => setSnapToGrid((prev) => !prev)}
            onChangeGridSize={setGridSize}
            onApplyColorToWholeMesh={handleApplyColorToWholeMesh}
            onToggleAmbientLight={() => setAmbientLightOn((prev) => !prev)}
            onChangeAmbientIntensity={setAmbientIntensity}
            onToggleDirectionalLight={() => setDirectionalLightOn((prev) => !prev)}
            onChangeDirectionalIntensity={setDirectionalIntensity}
            onToggleFillLight={() => setFillLightOn((prev) => !prev)}
            onChangeFillIntensity={setFillIntensity}
            onApplyLightingPreset={handleApplyLightingPreset}
            onBrightenDarkModels={handleBrightenDarkModels}
          />
        )}
      </div>

      {/* Preset Models Modal */}
      <SampleModelsModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleLoadSample}
      />
    </div>
  );
}
