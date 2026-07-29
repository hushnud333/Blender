import React from 'react';
import { X, Trees, Sword, Rocket, Home, Shield, Sparkles } from 'lucide-react';
import { SAMPLE_MODELS_LIST } from '../utils/sampleModels';

interface SampleModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (id: string) => void;
}

export const SampleModelsModal: React.FC<SampleModelsModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Trees':
        return <Trees className="w-6 h-6 text-emerald-400" />;
      case 'Sword':
        return <Sword className="w-6 h-6 text-amber-400" />;
      case 'Rocket':
        return <Rocket className="w-6 h-6 text-cyan-400" />;
      case 'Home':
        return <Home className="w-6 h-6 text-rose-400" />;
      case 'Shield':
        return <Shield className="w-6 h-6 text-blue-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f0f12] border border-[#1f1f23] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#141417]/80">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Low-Poly Asset Presets
            </h2>
            <p className="text-xs text-[#8e8e93]">Select a pre-built low-poly model to inspect and edit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1f1f23] text-[#8e8e93] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Cards */}
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {SAMPLE_MODELS_LIST.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample.id);
                onClose();
              }}
              className="bg-[#141417] border border-[#1f1f23] hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-[#0f0f12] rounded-lg border border-[#1f1f23] group-hover:border-[#27272a]">
                  {renderIcon(sample.iconName)}
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#0f0f12] text-[#8e8e93] border border-[#1f1f23]">
                  {sample.category}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
                  {sample.name}
                </h3>
                <p className="text-xs text-[#8e8e93] mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1f1f23] flex items-center justify-between text-[11px] text-[#71717a] font-mono">
                <span>{sample.polyCount} polys</span>
                <span className="text-indigo-400 font-sans font-medium group-hover:underline">
                  Load Model &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
