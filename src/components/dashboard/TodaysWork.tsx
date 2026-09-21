import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/src/components/ui/Button.tsx';

interface TodaysWorkProps {
  onFindLeads?: () => void;
}

export const TodaysWork: React.FC<TodaysWorkProps> = ({ onFindLeads }) => {
  return (
    <div className="bg-white border border-[#E8E9EC] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#171717]">Today</h2>
      </div>

      <div className="py-8 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 rounded-md bg-[#F7F7F8] border border-[#E8E9EC] flex items-center justify-center text-[#98A1B2] mb-2.5">
          <Inbox className="w-4 h-4 stroke-[1.75]" />
        </div>
        <p className="text-xs font-medium text-[#171717]">Nothing needs attention yet.</p>
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onFindLeads}>
            Find leads
          </Button>
        </div>
      </div>
    </div>
  );
};

