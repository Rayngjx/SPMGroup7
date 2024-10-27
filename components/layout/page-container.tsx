import React from 'react';

export default function PageContainer({
  children,
  scrollable = false
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <div className="h-[calc(100dvh-52px)] overflow-auto">
          <div className="h-full w-full overflow-x-auto">{children}</div>
        </div>
      ) : (
        <div className="h-full w-full overflow-x-auto">{children}</div>
      )}
    </>
  );
}
