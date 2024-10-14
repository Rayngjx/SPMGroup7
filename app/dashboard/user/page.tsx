import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/user-tables/client';
import { users } from '@/constants/data';
import PersonalSchedule from '@/components/dashboard/ownSchedule/personalSchedule';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'User', link: '/dashboard/user' }
];
export default function page() {
  return (
    <PageContainer>
      <div className="space-y-2">
        {/* <Breadcrumbs items={breadcrumbItems} />
        <UserClient data={users} /> */}
        <PersonalSchedule />
      </div>
    </PageContainer>
  );
}
