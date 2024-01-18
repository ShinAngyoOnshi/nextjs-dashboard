import CardWrapper from '@/app/ui/dashboard/cards';
// import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import { fetchCardData } from '@/app/lib/data'; // remove function
import { Suspense } from 'react';
import { 
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardSkeleton,
 } from '@/app/ui/skeletons';

 
export default async function Page() {
    // const revenue = await fetchRevenue(); delete this line in chapter 9
    // const latestInvoices = await fetchLatestInvoices(); // delete for streaming component latestInvoices
    // delete return from fetchCardData
    // const {
    //   numberOfCustomers,
    //   numberOfInvoices,
    //   totalPaidInvoices,
    //   totalPendingInvoices,
    // } = await fetchCardData();
    
      return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton />}>
          <CardWrapper></CardWrapper>
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton></RevenueChartSkeleton>}>
          <RevenueChart></RevenueChart>
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton></LatestInvoicesSkeleton>}>
          <LatestInvoices></LatestInvoices>
        </Suspense>

      </div>
    </main>
  );
}