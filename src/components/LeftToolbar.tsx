import React from 'react';
import { 
  MousePointer, 
  Move, 
  RotateCw, 
  Scale, 
  Maximize2, 
  Minimize2, 
  Split, 
  PaintBucket, 
  Combine, 
  Trash2, 
  Box, 
  Circle, 
  Cylinder, 
  Pyramid, 
  Square,
  Dot,
  SquareDashed
} from 'lucide-react';
import { EditMode, ToolType, PrimitiveType } from '../types';

interface LeftToolbarProps {
  editMode: EditMode;
  activeTool: ToolType;
  onSelectEditMode: (mode: EditMode) => void;
  onSelectTool: (tool: ToolType) => void;
  onAddPrimitive: (type: PrimitiveType) => void;
  onWeldVertices: () => void;
  onDeleteSelected: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  editMode,
  activeTool,
  onSelectEditMode,
  onSelectTool,
  onAddPrimitive,
  onWeldVertices,
  onDeleteSelected,
}) => {
  return (
    <aside className="w-16 bg-[#0f0f12] border-r border-[#1f1f23] flex flex-col items-center py-3 gap-4 text-[#a1a1aa] select-none z-10">
      {/* Mode Selector Group */}
      <div className="flex flex-col items-center gap-1 bg-[#141417] p-1 rounded-xl border border-[#1f1f23]">
        <button
          onClick={() => onSelectEditMode('object')}
          className={`p-2.5 rounded-lg transition relative group ${
            editMode === 'object'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
          title="Object Mode (Shortcut: 1)"
        >
          <Box className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Object Mode (1)
          </span>
        </button>

        <button
          onClick={() => onSelectEditMode('vertex')}
          className={`p-2.5 rounded-lg transition relative group ${
            editMode === 'vertex'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
          title="Vertex Mode (Shortcut: 2)"
        >
          <Dot className="w-4 h-4 scale-150" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Vertex Mode (2)
          </span>
        </button>

        <button
          onClick={() => onSelectEditMode('face')}
          className={`p-2.5 rounded-lg transition relative group ${
            editMode === 'face'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
          title="Face Mode (Shortcut: 3)"
        >
          <SquareDashed className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Face Mode (3)
          </span>
        </button>
      </div>

      <div className="w-8 h-px bg-[#1f1f23]" />

      {/* Main Tools Group */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={() => onSelectTool('select')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'select'
              ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Select Tool
          </span>
        </button>

        <button
          onClick={() => onSelectTool('translate')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'translate'
              ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <Move className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Translate / Grab (G)
          </span>
        </button>

        <button
          onClick={() => onSelectTool('rotate')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'rotate'
              ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Rotate (R)
          </span>
        </button>

        <button
          onClick={() => onSelectTool('scale')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'scale'
              ? 'bg-[#1f1f26] text-indigo-400 border border-[#2e2e38]'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Scale (S)
          </span>
        </button>
      </div>

      <div className="w-8 h-px bg-[#1f1f23]" />

      {/* Mesh Face Operations */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={() => onSelectTool('extrude')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'extrude'
              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Extrude Face (E)
          </span>
        </button>

        <button
          onClick={() => onSelectTool('inset')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'inset'
              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <Minimize2 className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Inset Face (I)
          </span>
        </button>

        <button
          onClick={() => onSelectTool('subdivide')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'subdivide'
              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <Split className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Subdivide Face (B)
          </span>
        </button>

        <button
          onClick={() => onSelectTool('paint')}
          className={`p-2.5 rounded-lg transition relative group ${
            activeTool === 'paint'
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
              : 'hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white'
          }`}
        >
          <PaintBucket className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Paint Bucket (P)
          </span>
        </button>

        <button
          onClick={onWeldVertices}
          className="p-2.5 rounded-lg transition relative group hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white"
        >
          <Combine className="w-4 h-4" />
          <span className="absolute left-14 bg-[#09090b] text-[#f4f4f5] text-[11px] px-2.5 py-1 rounded-md border border-[#27272a] pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
            Weld Vertices (M)
          </span>
        </button>
      </div>

      <div className="w-8 h-px bg-[#1f1f23]" />

      {/* Primitive Creator Flyout */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] text-[#71717a] font-mono uppercase">Add</div>
        <button
          onClick={() => onAddPrimitive('cube')}
          className="p-2 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-indigo-400 transition relative group"
          title="Add Low-Poly Cube"
        >
          <Box className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddPrimitive('sphere')}
          className="p-2 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-indigo-400 transition relative group"
          title="Add Low-Poly Icosphere"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddPrimitive('cylinder')}
          className="p-2 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-indigo-400 transition relative group"
          title="Add Cylinder"
        >
          <Cylinder className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddPrimitive('cone')}
          className="p-2 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-indigo-400 transition relative group"
          title="Add Cone / Pyramid"
        >
          <Pyramid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAddPrimitive('plane')}
          className="p-2 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-indigo-400 transition relative group"
          title="Add Quad Plane"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-auto" />

      {/* Delete Selection */}
      <button
        onClick={onDeleteSelected}
        className="p-2.5 rounded-lg hover:bg-rose-950/50 text-[#8e8e93] hover:text-rose-400 transition relative group mb-2"
        title="Delete Selected (Del)"
      >
        <Trash2 className="w-4 h-4" />
        <span className="absolute left-14 bg-[#09090b] text-rose-400 text-[11px] px-2.5 py-1 rounded-md border border-rose-900/60 pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-30 shadow-xl">
          Delete (Del)
        </span>
      </button>
    </aside>
  );
};
