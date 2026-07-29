import * as THREE from 'three';
import { convertToNonIndexedFlatGeometry } from './meshUtils';
import { ModelSample } from '../types';

export const SAMPLE_MODELS_LIST: ModelSample[] = [
  {
    id: 'tree',
    name: 'Low-Poly Pine Tree',
    category: 'Nature',
    description: 'Stylized evergreen pine tree with trunk and tiered foliage.',
    iconName: 'Trees',
    polyCount: 42
  },
  {
    id: 'sword',
    name: 'Adventurer Broadsword',
    category: 'Weapons',
    description: 'Classic RPG low-poly sword with hilt, crossguard, and double-edge blade.',
    iconName: 'Sword',
    polyCount: 36
  },
  {
    id: 'spaceship',
    name: 'Sci-Fi Starfighter',
    category: 'Vehicles',
    description: 'Futuristic low-poly spaceship with delta wings, cockpit, and dual thrusters.',
    iconName: 'Rocket',
    polyCount: 68
  },
  {
    id: 'house',
    name: 'Cozy Low-Poly Cottage',
    category: 'Architecture',
    description: 'Charming medieval cottage with pitched roof, chimney, and stone base.',
    iconName: 'Home',
    polyCount: 48
  },
  {
    id: 'shield',
    name: 'Knight Shield',
    category: 'Weapons',
    description: 'Beveled heater shield with metal rim and central crest.',
    iconName: 'Shield',
    polyCount: 32
  }
];

export function buildSampleModel(id: string): THREE.Group {
  const group = new THREE.Group();
  group.name = id;

  switch (id) {
    case 'tree': {
      // Trunk
      const trunkGeom = convertToNonIndexedFlatGeometry(
        new THREE.CylinderGeometry(0.3, 0.5, 1.8, 6),
        '#78350f' // Brown
      );
      const trunkMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true,
        side: THREE.DoubleSide
      });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.name = 'Tree Trunk';
      trunk.userData.defaultColor = '#78350f';
      trunk.position.y = 0.9;
      group.add(trunk);

      // Leaves tier 1
      const tier1Geom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(1.6, 1.8, 6),
        '#15803d' // Dark Green
      );
      const leavesMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        flatShading: true,
        side: THREE.DoubleSide
      });
      const tier1 = new THREE.Mesh(tier1Geom, leavesMat);
      tier1.name = 'Foliage Tier 1';
      tier1.userData.defaultColor = '#15803d';
      tier1.position.y = 2.0;
      group.add(tier1);

      // Leaves tier 2
      const tier2Geom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(1.2, 1.5, 6),
        '#22c55e' // Bright Green
      );
      const tier2 = new THREE.Mesh(tier2Geom, leavesMat);
      tier2.name = 'Foliage Tier 2';
      tier2.userData.defaultColor = '#22c55e';
      tier2.position.y = 2.9;
      group.add(tier2);

      // Leaves tier 3 (top)
      const tier3Geom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(0.8, 1.2, 5),
        '#4ade80' // Light Green
      );
      const tier3 = new THREE.Mesh(tier3Geom, leavesMat);
      tier3.name = 'Foliage Top Tier';
      tier3.userData.defaultColor = '#4ade80';
      tier3.position.y = 3.6;
      group.add(tier3);

      break;
    }

    case 'sword': {
      // Blade
      const bladeGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(0.3, 3.2, 0.08),
        '#94a3b8' // Slate Silver
      );
      const bladeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.8,
        roughness: 0.2,
        flatShading: true
      });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 2.2;
      group.add(blade);

      // Blade Tip
      const tipGeom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(0.22, 0.8, 4),
        '#cbd5e1'
      );
      const tip = new THREE.Mesh(tipGeom, bladeMat);
      tip.position.y = 4.1;
      group.add(tip);

      // Guard
      const guardGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(1.2, 0.2, 0.25),
        '#d97706' // Gold/Amber
      );
      const goldMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.9,
        roughness: 0.3,
        flatShading: true
      });
      const guard = new THREE.Mesh(guardGeom, goldMat);
      guard.position.y = 0.5;
      group.add(guard);

      // Handle/Grip
      const gripGeom = convertToNonIndexedFlatGeometry(
        new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6),
        '#451a03' // Dark Leather
      );
      const gripMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        flatShading: true
      });
      const grip = new THREE.Mesh(gripGeom, gripMat);
      grip.position.y = 0.0;
      group.add(grip);

      // Pommel
      const pommelGeom = convertToNonIndexedFlatGeometry(
        new THREE.IcosahedronGeometry(0.2, 0),
        '#d97706'
      );
      const pommel = new THREE.Mesh(pommelGeom, goldMat);
      pommel.position.y = -0.45;
      group.add(pommel);

      break;
    }

    case 'spaceship': {
      // Fuselage / Cockpit
      const bodyGeom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(0.8, 3.5, 6),
        '#1e293b' // Dark Slate
      );
      bodyGeom.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.6,
        roughness: 0.3,
        flatShading: true
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      group.add(body);

      // Canopy Glass
      const canopyGeom = convertToNonIndexedFlatGeometry(
        new THREE.IcosahedronGeometry(0.45, 0),
        '#06b6d4' // Cyan glass
      );
      const canopyMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.1,
        metalness: 0.9,
        flatShading: true
      });
      const canopy = new THREE.Mesh(canopyGeom, canopyMat);
      canopy.position.set(0, 0.3, 0.3);
      canopy.scale.set(0.8, 0.6, 1.4);
      group.add(canopy);

      // Left Wing
      const wingGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(2.0, 0.1, 1.2),
        '#3b82f6' // Blue accent
      );
      const wingMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.5,
        roughness: 0.4,
        flatShading: true
      });
      const leftWing = new THREE.Mesh(wingGeom, wingMat);
      leftWing.position.set(-1.2, 0, -0.4);
      leftWing.rotation.z = 0.1;
      leftWing.rotation.y = -0.2;
      group.add(leftWing);

      // Right Wing
      const rightWing = leftWing.clone();
      rightWing.position.set(1.2, 0, -0.4);
      rightWing.rotation.z = -0.1;
      rightWing.rotation.y = 0.2;
      group.add(rightWing);

      // Dual Thrusters
      const thrusterGeom = convertToNonIndexedFlatGeometry(
        new THREE.CylinderGeometry(0.25, 0.2, 0.8, 6),
        '#f97316' // Orange Engine glow
      );
      thrusterGeom.rotateX(Math.PI / 2);
      const thrusterMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissive: new THREE.Color('#f97316'),
        emissiveIntensity: 0.6,
        flatShading: true
      });

      const leftEng = new THREE.Mesh(thrusterGeom, thrusterMat);
      leftEng.position.set(-0.4, 0, -1.6);
      group.add(leftEng);

      const rightEng = new THREE.Mesh(thrusterGeom, thrusterMat);
      rightEng.position.set(0.4, 0, -1.6);
      group.add(rightEng);

      break;
    }

    case 'house': {
      // Main Base
      const baseGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(2.2, 1.8, 2.2),
        '#fef3c7' // Warm Cream
      );
      const houseMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        flatShading: true
      });
      const base = new THREE.Mesh(baseGeom, houseMat);
      base.position.y = 0.9;
      group.add(base);

      // Roof
      const roofGeom = convertToNonIndexedFlatGeometry(
        new THREE.ConeGeometry(1.9, 1.4, 4),
        '#b91c1c' // Terracotta Red
      );
      roofGeom.rotateY(Math.PI / 4);
      const roofMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        flatShading: true
      });
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.y = 2.5;
      group.add(roof);

      // Door
      const doorGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(0.6, 1.0, 0.1),
        '#78350f'
      );
      const door = new THREE.Mesh(doorGeom, houseMat);
      door.position.set(0, 0.5, 1.12);
      group.add(door);

      // Chimney
      const chimneyGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(0.4, 1.0, 0.4),
        '#475569' // Stone slate
      );
      const chimney = new THREE.Mesh(chimneyGeom, houseMat);
      chimney.position.set(0.6, 2.6, -0.4);
      group.add(chimney);

      break;
    }

    case 'shield': {
      const shieldGeom = convertToNonIndexedFlatGeometry(
        new THREE.BoxGeometry(1.4, 1.8, 0.2),
        '#1d4ed8' // Royal Blue
      );
      const shieldMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.6,
        flatShading: true
      });
      const shield = new THREE.Mesh(shieldGeom, shieldMat);
      shield.position.y = 1.0;
      group.add(shield);

      const rimGeom = convertToNonIndexedFlatGeometry(
        new THREE.TorusGeometry(0.8, 0.08, 4, 8),
        '#eab308' // Gold Rim
      );
      const rimMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.9,
        roughness: 0.2,
        flatShading: true
      });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.position.set(0, 1.0, 0.1);
      group.add(rim);

      break;
    }
  }

  // Ensure all child meshes are tagged as user meshes with shadow support and double-sided materials
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData.isUserMesh = true;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material && !Array.isArray(child.material)) {
        (child.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      }
    }
  });

  return group;
}
