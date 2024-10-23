import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';

import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import WFHCalendar from '@/components/dashboard/overviewcalendar/overviewcalendar';
import { auth } from '@/auth';

import CreateRequestForm from '@/components/forms/create-request/wfh-request';

export default async function page() {
  const session = await auth();

  let staffId = 'User';
  let staff_fname = 'User';
  let role_id = 'User';

  if (!session) {
    return <div>Please log in</div>;
  }

  if (session?.user?.id) {
    staffId = String(session.user.staff_id);
    staff_fname = String(session.user.staff_fname); // Set staffId from the session object
    role_id = String(session.user.role_id);
  }

  let users = [];
  let error = null;
  let requests = [];

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back {staff_fname} ({staffId}) {role_id}
          </h2>

          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div>
              <CreateRequestForm />
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <WFHCalendar></WFHCalendar>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
