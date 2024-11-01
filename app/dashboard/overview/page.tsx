'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WFHCalendar from '@/components/dashboard/overviewcalendar/overviewcalendar';
import PageContainer from '@/components/layout/page-container';

export default function OverviewPage() {
  return (
    <PageContainer scrollable={true}>
      <div className="space-y-6 p-10">
        <h1 className="text-3xl font-bold">Overview</h1>

        <Card>
          <CardHeader>
            <CardTitle>WFH Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <WFHCalendar />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
