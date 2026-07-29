import React, { useState } from 'react';
import { 
  Layers, 
  Sliders, 
  Palette, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Sparkles,
  Check,
  Grid,
  Sun,
  Lightbulb,
  Zap,
  Smartphone
} from 'lucide-react';
import { EditableMeshNode, LowPolyColorPalette } from '../types';
import { COLOR_PALETTES } from '../utils/paletteData';

interface RightSidebarProps {
  nodes: EditableMeshNode[];
  activeMeshId: string | null;
  extrudeDepth: number;
  insetRatio: number;
  selectedColor: string;
  snapToGrid: boolean;
  gridSize: number;
  ambientLightOn: boolean;
  ambientIntensity: number;
  directionalLightOn: boolean;
  directionalIntensity: number;
  fillLightOn: boolean;
  fillIntensity: number;
  onSelectNode: (id: string) => void;
  onToggleNodeVisibility: (id: string) => void;
  onToggleNodeLock: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onUpdateTransform: (id: string, pos: [number, number, number], rot: [number, number, number], scale: [number, number, number]) => void;
  onChangeExtrudeDepth: (val: number) => void;
  onChangeInsetRatio: (val: number) => void;
  onChangeColor: (hex: string) => void;
  onToggleSnapToGrid: () => void;
  onChangeGridSize: (size: number) => void;
  onApplyColorToWholeMesh: () => void;
  onToggleAmbientLight: () => void;
  onChangeAmbientIntensity: (val: number) => void;
  onToggleDirectionalLight: () => void;
  onChangeDirectionalIntensity: (val: number) => void;
  onToggleFillLight: () => void;
  onChangeFillIntensity: (val: number) => void;
  onApplyLightingPreset: (preset: 'studio' | 'bright' | 'soft' | 'dramatic') => void;
  onBrightenDarkModels: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  nodes,
  activeMeshId,
  extrudeDepth,
  insetRatio,
  selectedColor,
  snapToGrid,
  gridSize,
  ambientLightOn,
  ambientIntensity,
  directionalLightOn,
  directionalIntensity,
  fillLightOn,
  fillIntensity,
  onSelectNode,
  onToggleNodeVisibility,
  onToggleNodeLock,
  onDuplicateNode,
  onDeleteNode,
  onUpdateTransform,
  onChangeExtrudeDepth,
  onChangeInsetRatio,
  onChangeColor,
  onToggleSnapToGrid,
  onChangeGridSize,
  onApplyColorToWholeMesh,
  onToggleAmbientLight,
  onChangeAmbientIntensity,
  onToggleDirectionalLight,
  onChangeDirectionalIntensity,
  onToggleFillLight,
  onChangeFillIntensity,
  onApplyLightingPreset,
  onBrightenDarkModels,
}) => {
  const [activeTab, setActiveTab] = useState<'outliner' | 'properties' | 'lighting' | 'palette' | 'shortcuts'>('outliner');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('retro-arcade');

  const activeNode = nodes.find(n => n.id === activeMeshId);
  const currentPalette = COLOR_PALETTES.find(p => p.id === selectedPaletteId) || COLOR_PALETTES[0];

  return (
    <aside className="w-80 bg-[#0f0f12] border-l border-[#1f1f23] flex flex-col h-full text-[#e4e4e7] select-none z-10">
      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-[#1f1f23] bg-[#141417]/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab('outliner')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition ${
            activeTab === 'outliner' ? 'bg-[#1f1f26] text-indigo-400 font-semibold border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-[#e4e4e7]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Scene</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition ${
            activeTab === 'properties' ? 'bg-[#1f1f26] text-indigo-400 font-semibold border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-[#e4e4e7]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('lighting')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition ${
            activeTab === 'lighting' ? 'bg-[#1f1f26] text-[#f59e0b] font-semibold border border-amber-500/30' : 'text-[#8e8e93] hover:text-[#e4e4e7]'
          }`}
          title="Scene Lighting & Exposure"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Light</span>
        </button>

        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition ${
            activeTab === 'palette' ? 'bg-[#1f1f26] text-indigo-400 font-semibold border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-[#e4e4e7]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`p-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'shortcuts' ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-[#e4e4e7]'
          }`}
          title="Keyboard Shortcuts & Mobile Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tab 1: Scene Outliner */}
        {activeTab === 'outliner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
              <span>Scene Graph ({nodes.length})</span>
            </div>

            {nodes.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#1f1f23] rounded-xl text-[#71717a] text-xs">
                No 3D objects in scene. Create a primitive from the left toolbar!
              </div>
            ) : (
              <div className="space-y-1.5">
                {nodes.map((node) => {
                  const isSelected = node.id === activeMeshId;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-700/60 text-white shadow-sm'
                          : 'bg-[#141417] border-[#1f1f23] text-[#d4d4d8] hover:bg-[#18181c]'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-[#27272a]"
                          style={{ backgroundColor: node.color }}
                        />
                        <span className="font-medium truncate">{node.name}</span>
                        <span className="text-[10px] text-[#71717a] font-mono">
                          ({node.faceCount}p)
                        </span>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleNodeVisibility(node.id)}
                          className="p-1 hover:bg-[#1f1f23] rounded text-[#8e8e93] hover:text-white"
                          title="Toggle Visibility"
                        >
                          {node.visible ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-[#52525b]" />}
                        </button>
                        <button
                          onClick={() => onToggleNodeLock(node.id)}
                          className="p-1 hover:bg-[#1f1f23] rounded text-[#8e8e93] hover:text-white"
                          title="Toggle Lock"
                        >
                          {node.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-[#52525b]" />}
                        </button>
                        <button
                          onClick={() => onDuplicateNode(node.id)}
                          className="p-1 hover:bg-[#1f1f23] rounded text-[#8e8e93] hover:text-white"
                          title="Duplicate Mesh"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#8e8e93]" />
                        </button>
                        <button
                          onClick={() => onDeleteNode(node.id)}
                          className="p-1 hover:bg-[#1f1f23] rounded text-[#8e8e93] hover:text-rose-400"
                          title="Delete Mesh"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#8e8e93]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transform & Tool Properties */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Active Mesh Numerical Transforms */}
            {activeNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
                  <span>Transform: {activeNode.name}</span>
                </div>

                {/* Position */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8e8e93] font-medium">Position (X, Y, Z)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={`pos-${axis}`} className="flex items-center bg-[#141417] rounded-md border border-[#1f1f23] px-2 py-1 text-xs">
                        <span className="text-indigo-400 font-bold mr-1">{axis}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={activeNode.position[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const newPos = [...activeNode.position] as [number, number, number];
                            newPos[i] = val;
                            onUpdateTransform(activeNode.id, newPos, activeNode.rotation, activeNode.scale);
                          }}
                          className="w-full bg-transparent text-[#e4e4e7] outline-none font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8e8e93] font-medium">Rotation (°)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={`rot-${axis}`} className="flex items-center bg-[#141417] rounded-md border border-[#1f1f23] px-2 py-1 text-xs">
                        <span className="text-amber-400 font-bold mr-1">{axis}</span>
                        <input
                          type="number"
                          step="5"
                          value={Math.round((activeNode.rotation[i] * 180) / Math.PI)}
                          onChange={(e) => {
                            const deg = parseFloat(e.target.value) || 0;
                            const rad = (deg * Math.PI) / 180;
                            const newRot = [...activeNode.rotation] as [number, number, number];
                            newRot[i] = rad;
                            onUpdateTransform(activeNode.id, activeNode.position, newRot, activeNode.scale);
                          }}
                          className="w-full bg-transparent text-[#e4e4e7] outline-none font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div className="space-y-1">
                  <label className="text-[11px] text-[#8e8e93] font-medium">Scale</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={`scale-${axis}`} className="flex items-center bg-[#141417] rounded-md border border-[#1f1f23] px-2 py-1 text-xs">
                        <span className="text-emerald-400 font-bold mr-1">{axis}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={activeNode.scale[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.1;
                            const newScale = [...activeNode.scale] as [number, number, number];
                            newScale[i] = val;
                            onUpdateTransform(activeNode.id, activeNode.position, activeNode.rotation, newScale);
                          }}
                          className="w-full bg-transparent text-[#e4e4e7] outline-none font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#141417] rounded-xl border border-[#1f1f23] text-[#71717a] text-xs text-center">
                Select an object in the scene to inspect & adjust transforms.
              </div>
            )}

            <div className="h-px bg-[#1f1f23]" />

            {/* Modeling Tool Parameters */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
                Mesh Tool Settings
              </div>

              {/* Extrude Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#d4d4d8]">
                  <span>Extrude Depth</span>
                  <span className="font-mono text-indigo-400">{extrudeDepth.toFixed(2)} units</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={extrudeDepth}
                  onChange={(e) => onChangeExtrudeDepth(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-[#141417] h-1.5 rounded"
                />
              </div>

              {/* Inset Ratio Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#d4d4d8]">
                  <span>Face Inset Ratio</span>
                  <span className="font-mono text-amber-400">{insetRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={insetRatio}
                  onChange={(e) => onChangeInsetRatio(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-[#141417] h-1.5 rounded"
                />
              </div>

              {/* Grid Snap Control */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#d4d4d8] flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-indigo-400" />
                    Snap to Grid
                  </span>
                  <button
                    onClick={onToggleSnapToGrid}
                    className={`w-9 h-5 rounded-full transition flex items-center p-0.5 ${
                      snapToGrid ? 'bg-indigo-600 justify-end' : 'bg-[#1f1f23] justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>

                {snapToGrid && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-[#8e8e93]">Step:</span>
                    {[0.1, 0.5, 1.0].map((size) => (
                      <button
                        key={size}
                        onClick={() => onChangeGridSize(size)}
                        className={`px-2 py-1 text-xs rounded font-mono ${
                          gridSize === size ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]' : 'bg-[#141417] text-[#8e8e93] hover:text-white'
                        }`}
                      >
                        {size}u
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Color Palette & Painter */}
        {activeTab === 'palette' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
              <span>Low-Poly Color Palette</span>
            </div>

            {/* Palette Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8e8e93] font-medium">Theme Preset</label>
              <select
                value={selectedPaletteId}
                onChange={(e) => setSelectedPaletteId(e.target.value)}
                className="w-full bg-[#141417] border border-[#1f1f23] text-[#e4e4e7] text-xs rounded-lg p-2 outline-none focus:border-indigo-500"
              >
                {COLOR_PALETTES.map((pal) => (
                  <option key={pal.id} value={pal.id}>
                    {pal.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-7 gap-2">
              {currentPalette.colors.map((hex) => {
                const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    onClick={() => onChangeColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition hover:scale-110 shadow-sm ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f12] border-white' : 'border-[#1f1f23]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onChangeColor(e.target.value)}
                className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
              />
              <div className="flex-1">
                <label className="text-[10px] text-[#71717a] uppercase font-mono">Custom Hex</label>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => onChangeColor(e.target.value)}
                  className="w-full bg-[#141417] border border-[#1f1f23] rounded px-2.5 py-1 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Apply Color Button */}
            <button
              onClick={onApplyColorToWholeMesh}
              className="w-full py-2.5 bg-[#1f1f23] hover:bg-[#27272a] text-[#e4e4e7] text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition border border-[#27272a]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Color to Whole Mesh</span>
            </button>
          </div>
        )}

        {/* Tab 4: Scene Lighting Control Panel */}
        {activeTab === 'lighting' && (
          <div className="space-y-5 text-xs">
            {/* Header Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Sun className="w-4 h-4" />
                <span>Scene Lighting & Exposure</span>
              </div>
              <p className="text-[11px] text-[#8e8e93] mt-1 leading-normal">
                Toggle lights and adjust intensities to ensure dark models and complex geometry are clearly visible.
              </p>
            </div>

            {/* Quick Action: Brighten Dark Models */}
            <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-indigo-950/40 p-3.5 rounded-xl border border-amber-500/30 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dark Model Visibility Boost</span>
              </div>
              <p className="text-[11px] text-[#d4d4d8] leading-tight">
                Instantly boost ambient & key lighting so dark or unlit models pop cleanly against the canvas.
              </p>
              <button
                onClick={onBrightenDarkModels}
                className="w-full mt-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Brighten Dark Models</span>
              </button>
            </div>

            {/* Lighting Presets Grid */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#8e8e93] font-medium">Lighting Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onApplyLightingPreset('studio')}
                  className="p-2 bg-[#141417] hover:bg-[#18181c] border border-[#1f1f23] rounded-lg text-left transition"
                >
                  <div className="font-semibold text-[#e4e4e7]">Studio</div>
                  <div className="text-[10px] text-[#71717a]">Balanced warm & cool</div>
                </button>

                <button
                  onClick={() => onApplyLightingPreset('bright')}
                  className="p-2 bg-[#141417] hover:bg-[#18181c] border border-[#1f1f23] rounded-lg text-left transition"
                >
                  <div className="font-semibold text-amber-300">Daylight</div>
                  <div className="text-[10px] text-[#71717a]">High ambient & key</div>
                </button>

                <button
                  onClick={() => onApplyLightingPreset('soft')}
                  className="p-2 bg-[#141417] hover:bg-[#18181c] border border-[#1f1f23] rounded-lg text-left transition"
                >
                  <div className="font-semibold text-sky-300">Soft Ambient</div>
                  <div className="text-[10px] text-[#71717a]">Uniform soft light</div>
                </button>

                <button
                  onClick={() => onApplyLightingPreset('dramatic')}
                  className="p-2 bg-[#141417] hover:bg-[#18181c] border border-[#1f1f23] rounded-lg text-left transition"
                >
                  <div className="font-semibold text-indigo-300">High Contrast</div>
                  <div className="text-[10px] text-[#71717a]">Strong key shadow</div>
                </button>
              </div>
            </div>

            <div className="h-px bg-[#1f1f23]" />

            {/* Ambient Light Controls */}
            <div className="bg-[#141417] p-3 rounded-xl border border-[#1f1f23] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-[#e4e4e7]">Ambient Light</span>
                </div>
                <button
                  onClick={onToggleAmbientLight}
                  className={`w-9 h-5 rounded-full transition flex items-center p-0.5 ${
                    ambientLightOn ? 'bg-amber-500 justify-end' : 'bg-[#1f1f23] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {ambientLightOn && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#8e8e93]">
                    <span>Intensity</span>
                    <span className="font-mono text-amber-300 font-medium">{ambientIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={ambientIntensity}
                    onChange={(e) => onChangeAmbientIntensity(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-[#1f1f23] h-1.5 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Directional Key Light Controls */}
            <div className="bg-[#141417] p-3 rounded-xl border border-[#1f1f23] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium text-[#e4e4e7]">Directional Key Light</span>
                </div>
                <button
                  onClick={onToggleDirectionalLight}
                  className={`w-9 h-5 rounded-full transition flex items-center p-0.5 ${
                    directionalLightOn ? 'bg-indigo-600 justify-end' : 'bg-[#1f1f23] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {directionalLightOn && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#8e8e93]">
                    <span>Intensity</span>
                    <span className="font-mono text-indigo-300 font-medium">{directionalIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={directionalIntensity}
                    onChange={(e) => onChangeDirectionalIntensity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-[#1f1f23] h-1.5 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Fill Light Controls */}
            <div className="bg-[#141417] p-3 rounded-xl border border-[#1f1f23] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-medium text-[#e4e4e7]">Secondary Fill Light</span>
                </div>
                <button
                  onClick={onToggleFillLight}
                  className={`w-9 h-5 rounded-full transition flex items-center p-0.5 ${
                    fillLightOn ? 'bg-sky-500 justify-end' : 'bg-[#1f1f23] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {fillLightOn && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#8e8e93]">
                    <span>Intensity</span>
                    <span className="font-mono text-sky-300 font-medium">{fillIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={fillIntensity}
                    onChange={(e) => onChangeFillIntensity(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-[#1f1f23] h-1.5 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Shortcuts & Mobile Guide */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-4 text-xs">
            {/* Mobile Touch Navigation Section */}
            <div className="bg-[#141417] p-3 rounded-xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Phone Controls</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#d4d4d8]">
                <div className="flex justify-between border-b border-[#1f1f23] pb-1">
                  <span>1-Finger Drag</span>
                  <span className="text-indigo-300 font-medium">Rotate Camera</span>
                </div>
                <div className="flex justify-between border-b border-[#1f1f23] pb-1">
                  <span>2-Finger Pinch</span>
                  <span className="text-indigo-300 font-medium">Zoom In / Out</span>
                </div>
                <div className="flex justify-between border-b border-[#1f1f23] pb-1">
                  <span>2-Finger Drag</span>
                  <span className="text-indigo-300 font-medium">Pan Camera</span>
                </div>
                <div className="flex justify-between">
                  <span>Single Tap</span>
                  <span className="text-indigo-300 font-medium">Select Object/Face</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
              Keyboard Shortcuts
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Object Mode</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-indigo-400 rounded border border-[#27272a]">1</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Vertex Mode</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-indigo-400 rounded border border-[#27272a]">2</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Face Mode</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-indigo-400 rounded border border-[#27272a]">3</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Translate / Grab</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-amber-400 rounded border border-[#27272a]">G</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Rotate</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-amber-400 rounded border border-[#27272a]">R</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Scale</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-amber-400 rounded border border-[#27272a]">S</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Extrude Face</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-emerald-400 rounded border border-[#27272a]">E</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Paint Bucket</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-emerald-400 rounded border border-[#27272a]">P</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Toggle Wireframe</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-[#d4d4d8] rounded border border-[#27272a]">Z</kbd>
              </div>
              <div className="flex justify-between items-center bg-[#141417] p-2 rounded border border-[#1f1f23]">
                <span className="text-[#d4d4d8]">Undo / Redo</span>
                <kbd className="px-1.5 py-0.5 bg-[#1f1f23] text-[#d4d4d8] rounded border border-[#27272a]">Ctrl+Z / Ctrl+Y</kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
