// import { CalendarDateRangePicker } from '@/components/date-range-picker';
// import PageContainer from '@/components/layout/page-container';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import WFHCalendar from '@/components/test';

// export default function DashboardPage() {
//   return (
//     <PageContainer scrollable={true}>
//       <div className="space-y-2">
//         <div className="flex items-center justify-between space-y-2">
//           <h2 className="text-2xl font-bold tracking-tight">
//             Hi, Welcome back 👋
//           </h2>
//           <div className="hidden items-center space-x-2 md:flex">
//             <CalendarDateRangePicker />
//             <Button>Download</Button>
//           </div>
//         </div>
//         <Tabs defaultValue="overview" className="space-y-4">
//           <TabsList>
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//           </TabsList>
//           <TabsContent value="overview" className="space-y-4">
//             {/* Your existing overview content */}
//           </TabsContent>
//           <TabsContent value="analytics" className="space-y-4">
//             <WFHCalendar />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </PageContainer>
//   );
// }

import { CalendarDateRangePicker } from '@/components/date-range-picker';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedWFHCalendar from '@/components/dashboard/staffTeamSchedule/EnhancedWFHCalendar';

export default function DashboardPage() {
  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
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
            {/* Your existing overview content */}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <EnhancedWFHCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}