import React, { useRef } from 'react';
import { 
  Box, 
  Download, 
  Upload, 
  RotateCcw, 
  RotateCw, 
  Grid, 
  LayoutGrid, 
  Sun, 
  Moon, 
  Cpu, 
  Layers, 
  FolderOpen,
  PlusCircle,
  Sparkles,
  FileCode,
  PanelLeft,
  PanelRight,
  Lightbulb,
  Zap,
  Smartphone
} from 'lucide-react';
import { MemoryStats } from '../types';

interface HeaderBarProps {
  memoryStats: MemoryStats;
  wireframeMode: boolean;
  showGrid: boolean;
  showShadows: boolean;
  canUndo: boolean;
  canRedo: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onBrightenDarkModels: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleWireframe: () => void;
  onToggleGrid: () => void;
  onToggleShadows: () => void;
  onNewScene: () => void;
  onOpenSampleModal: () => void;
  onExportGLTF: () => void;
  onExportOBJ: () => void;
  onSaveProject: () => void;
  onLoadProject: (jsonString: string) => void;
  onImportFile: (file: File) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  memoryStats,
  wireframeMode,
  showGrid,
  showShadows,
  canUndo,
  canRedo,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onBrightenDarkModels,
  onUndo,
  onRedo,
  onToggleWireframe,
  onToggleGrid,
  onToggleShadows,
  onNewScene,
  onOpenSampleModal,
  onExportGLTF,
  onExportOBJ,
  onSaveProject,
  onLoadProject,
  onImportFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onLoadProject(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 bg-[#0f0f12] border-b border-[#1f1f23] px-3 sm:px-4 flex items-center justify-between text-[#e4e4e7] select-none z-20">
      {/* Brand & Logo & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded-lg border transition ${
            leftSidebarOpen
              ? 'bg-[#1f1f26] text-indigo-400 border-[#2e2e38]'
              : 'bg-[#141417] text-[#8e8e93] border-[#1f1f23] hover:text-white'
          }`}
          title="Toggle Tools Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/15 border border-indigo-400/20 shrink-0">
          <Box className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-semibold text-sm leading-tight text-white flex items-center gap-2">
            Low-Poly 3D Modeler
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#18181c] text-indigo-400 border border-[#27272a]">
              v1.0
            </span>
          </h1>
          <p className="text-[11px] text-[#8e8e93]">Lightweight Mesh Studio & Export</p>
        </div>
      </div>

      {/* Center Actions: File Menu & History */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Brighten Dark Models Button */}
        <button
          onClick={onBrightenDarkModels}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition shadow-sm"
          title="Boost scene light intensity to clarify dark models"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="hidden md:inline">Brighten Scene</span>
        </button>

        <div className="h-4 w-px bg-[#1f1f23] mx-0.5" />

        {/* Sample Gallery */}
        <button
          onClick={onOpenSampleModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span className="hidden xs:inline">Presets</span>
        </button>

        <div className="h-4 w-px bg-[#1f1f23] mx-1" />

        {/* New Scene */}
        <button
          onClick={onNewScene}
          className="p-1.5 rounded-md hover:bg-[#1f1f23] text-[#a1a1aa] hover:text-white transition"
          title="New Blank Scene"
        >
          <PlusCircle className="w-4 h-4" />
        </button>

        {/* Import Asset */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md hover:bg-[#1f1f23] text-[#d4d4d8] transition"
          title="Import GLTF or OBJ asset"
        >
          <Upload className="w-3.5 h-3.5 text-[#8e8e93]" />
          <span>Import</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".gltf,.glb,.obj"
          className="hidden"
        />

        {/* Export Menu Buttons */}
        <div className="flex items-center bg-[#141417] p-0.5 rounded-md border border-[#1f1f23]">
          <button
            onClick={onExportGLTF}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded text-indigo-400 hover:bg-[#1f1f23] transition"
            title="Export scene to .GLTF format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GLTF</span>
          </button>
          <button
            onClick={onExportOBJ}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded text-emerald-400 hover:bg-[#1f1f23] transition"
            title="Export scene to .OBJ format"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>OBJ</span>
          </button>
        </div>

        {/* Save/Load Project */}
        <button
          onClick={onSaveProject}
          className="p-1.5 rounded-md hover:bg-[#1f1f23] text-[#d4d4d8] transition"
          title="Save Scene Project JSON"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={projectInputRef}
          onChange={handleProjectChange}
          accept=".json"
          className="hidden"
        />

        <div className="h-4 w-px bg-[#1f1f23] mx-1" />

        {/* History: Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition ${
            canUndo ? 'hover:bg-[#1f1f23] text-[#e4e4e7]' : 'text-[#3f3f46] cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition ${
            canRedo ? 'hover:bg-[#1f1f23] text-[#e4e4e7]' : 'text-[#3f3f46] cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Right Stats & Viewport Toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggles */}
        <div className="flex items-center gap-1 bg-[#141417] p-1 rounded-lg border border-[#1f1f23]">
          <button
            onClick={onToggleWireframe}
            className={`p-1.5 rounded transition ${
              wireframeMode ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-white'
            }`}
            title="Toggle Wireframe overlay"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded transition ${
              showGrid ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]' : 'text-[#8e8e93] hover:text-white'
            }`}
            title="Toggle Ground Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleShadows}
            className={`p-1.5 rounded transition ${
              showShadows ? 'bg-amber-950/50 text-amber-400 border border-amber-800/60' : 'text-[#8e8e93] hover:text-white'
            }`}
            title="Toggle Directional Shadows"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Memory & Poly Stats Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-[#141417] px-3 py-1.5 rounded-lg border border-[#1f1f23] text-xs font-mono">
          <div className="flex items-center gap-1 text-[#d4d4d8]">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{memoryStats.totalPolyCount} polys</span>
          </div>
          <span className="text-[#27272a]">|</span>
          <div className="flex items-center gap-1 text-emerald-400" title="Low memory footprint requirement (<500MB)">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>{memoryStats.estimatedRamMB} MB RAM</span>
          </div>
        </div>

        {/* Right Sidebar Collapse Toggle Button */}
        <button
          onClick={onToggleRightSidebar}
          className={`p-1.5 rounded-lg border transition ${
            rightSidebarOpen
              ? 'bg-[#1f1f26] text-indigo-400 border-[#2e2e38]'
              : 'bg-[#141417] text-[#8e8e93] border-[#1f1f23] hover:text-white'
          }`}
          title="Toggle Scene & Lighting Inspector Sidebar"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
