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
      <div className="min-w-screen-sm w-full overflow-x-auto">
        <div className="min-w-screen-sm mx-auto">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="p-5 text-3xl font-bold tracking-tight">
              {name}'s Team
            </h2>
          </div>

          <Tabs defaultValue="schedule" className="pl-5">
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="reqList">Request List</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <div className="overflow-x-auto">
                <ManagerTeamScheduleView />
              </div>
            </TabsContent>

            <TabsContent value="reqList" className="space-y-4">
              <ManagerRequestList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
