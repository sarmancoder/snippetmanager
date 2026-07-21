import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useI18nProviderContext } from '@/I18nProvider';

export default function OpenRouterTab() {
  const { $t } = useI18nProviderContext();
  const [openRouterApiKey, setOpenRouterApiKey] = useLocalStorage('settings-openrouter-api-key', '');
  const [openRouterModel, setOpenRouterModel] = useLocalStorage('settings-openrouter-model', 'openai/gpt-4o-mini');

  return (
    <div className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="settings-openrouter-key">{$t('field-openrouter-api-key')}</FieldLabel>
        <FieldContent>
          <Input
            id="settings-openrouter-key"
            type="password"
            value={openRouterApiKey}
            onChange={(event) => setOpenRouterApiKey(event.target.value)}
            placeholder="sk-or-..."
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="settings-openrouter-model">{$t('field-openrouter-model')}</FieldLabel>
        <FieldContent>
          <Input
            id="settings-openrouter-model"
            value={openRouterModel}
            onChange={(event) => setOpenRouterModel(event.target.value)}
            placeholder="openai/gpt-4o-mini"
          />
        </FieldContent>
      </Field>
    </div>
  );
}
