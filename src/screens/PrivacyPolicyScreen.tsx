import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyScreen() {
  return (
    <PageWrapper>
      <TopBar title="Privacy Policy" showBack />
      <div className="px-4 pb-8 space-y-4">
        <div className="bg-bg-card rounded-2xl card-shadow p-4 flex items-start gap-3">
          <Shield className="w-6 h-6 text-accent mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-2">Your Data, Your Device</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Spendly stores all your data locally on your device using IndexedDB. No data is ever sent to any server, cloud, or third party.
            </p>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl card-shadow p-4 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">What we collect</h3>
          <p className="text-sm text-text-secondary leading-relaxed">Nothing. Spendly has no analytics, no tracking, no telemetry, and no ads.</p>

          <h3 className="text-sm font-semibold text-text-primary">Data storage</h3>
          <p className="text-sm text-text-secondary leading-relaxed">All transactions, wallets, goals, debts, and settings are stored in your browser's IndexedDB. Clearing browser data will erase app data — use Backup & Restore to keep a copy.</p>

          <h3 className="text-sm font-semibold text-text-primary">Third-party services</h3>
          <p className="text-sm text-text-secondary leading-relaxed">Spendly does not use any third-party services, APIs, or SDKs. The app works 100% offline.</p>

          <h3 className="text-sm font-semibold text-text-primary">Contact</h3>
          <p className="text-sm text-text-secondary leading-relaxed">For questions about this policy, reach out via the app's Play Store listing.</p>
        </div>

        <p className="text-xs text-text-muted text-center">Last updated: April 2026</p>
      </div>
    </PageWrapper>
  );
}
