import React from 'react';
import { Clock } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white border border-[#E8E9EC] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#171717]">Recent Activity</h2>
      </div>

      <div className="py-8 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 rounded-md bg-[#F7F7F8] border border-[#E8E9EC] flex items-center justify-center text-[#98A1B2] mb-2.5">
          <Clock className="w-4 h-4 stroke-[1.75]" />
        </div>
        <p className="text-xs text-[#6B7280]">No activity yet.</p>
      </div>
    </div>
  );
};
