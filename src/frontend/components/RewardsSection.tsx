import { Coins, Smartphone } from 'lucide-react';

interface RewardsSectionProps {
  tokens: number;
  onRedeem: () => void;
}

export default function RewardsSection({ tokens, onRedeem }: RewardsSectionProps) {
  return (
    <div className="bg-gradient-to-br from-farm-green-500 to-farm-green-600 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Coins className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white/90 text-base font-semibold">Tuzo Yako</p>
            <p className="text-white text-3xl font-bold">{tokens} WASTE</p>
          </div>
        </div>
      </div>
      <button
        onClick={onRedeem}
        className="w-full bg-white text-farm-green-700 font-bold text-xl py-5 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 min-h-[56px] flex items-center justify-center gap-3"
      >
        <Smartphone className="w-6 h-6" strokeWidth={2.5} />
        <span>Pata M-Pesa</span>
      </button>
    </div>
  );
}
