import { Metadata } from 'next';
import ManagerTeamScheduleView from '@/components/dashboard/managerTeamSchedule/TeamScheduleView';

export const metadata: Metadata = {
  title: 'Manager Team Schedule | Dashboard',
  description: "View and manage your team's schedule as a manager"
};

export default function ManagerTeamSchedulePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manager Team Schedule
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ManagerTeamScheduleView />
        </div>
      </div>
    </div>
  );
}
