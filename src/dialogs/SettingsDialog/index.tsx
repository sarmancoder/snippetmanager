import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18nProviderContext } from '@/I18nProvider';
import GeneralTab from './GeneralTab';
import OllamaTab from './OllamaTab';
import OpenRouterTab from './OpenRouterTab';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SettingsTab = 'general' | 'ollama' | 'openrouter';

const tabs: Array<{ key: SettingsTab; labelKey: string }> = [
  { key: 'general', labelKey: 'tab-general' },
  { key: 'ollama', labelKey: 'tab-ollama' },
  { key: 'openrouter', labelKey: 'tab-openrouter' },
];

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { $t } = useI18nProviderContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{$t('title-config')}</DialogTitle>
          <DialogDescription>{$t('dialog-settings-description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 border-b pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
              >
                {$t(tab.labelKey as any)}
              </button>
            ))}
          </div>

          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'ollama' && <OllamaTab />}
          {activeTab === 'openrouter' && <OpenRouterTab />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {$t('button-cancel')}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {$t('button-save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
