import { Metadata } from 'next';
import ManagerTeamScheduleView from '@/components/dashboard/managerTeamSchedule/TeamScheduleView';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Session } from 'next-auth';
import { auth } from '@/auth';
import ManagerRequestList from '@/components/dashboard/managerTeamSchedule/manager-request-list';

export const metadata: Metadata = {
  title: 'Manager Team Schedule | Dashboard',
  description: "View and manage your team's schedule as a manager"
};

export default async function ManagerTeamSchedulePage() {
  const session = await auth();
  const name = session?.user?.staff_fname;

  return (
    <PageContainer scrollable={true}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{name}'s Team</h2>
        </div>
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="reqList">Request List</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="w-full">
              <ManagerTeamScheduleView />
            </div>
          </TabsContent>
          <TabsContent value="reqList" className="space-y-4">
            <ManagerRequestList />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
