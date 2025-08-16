import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { LicenseGuard } from "@/components/license-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LicenseGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </LicenseGuard>
  );
}
