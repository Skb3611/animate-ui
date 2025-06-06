'use client';

import { StyleProvider } from '@/providers/style-provider';
import { ProgressProvider } from '@bprogress/next/app';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider color="#2B7FFF">
      <StyleProvider>{children}</StyleProvider>
    </ProgressProvider>
  );
};
