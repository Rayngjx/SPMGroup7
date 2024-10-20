import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/user-tables/client';
import { users } from '@/constants/data';
import PersonalSchedule from '@/components/dashboard/ownSchedule/personalSchedule';
// import RequestList from '@/components/dashboard/ownSchedule/requestlist';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'User', link: '/dashboard/user' }
];
export default function page() {
  return (
    <PageContainer>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <PersonalSchedule />
        </div>
      </div>
    </PageContainer>
  );
}
