import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useI18nProviderContext } from '@/I18nProvider';

export default function OllamaTab() {
  const { $t } = useI18nProviderContext();
  const [ollamaUrl, setOllamaUrl] = useLocalStorage('settings-ollama-url', 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useLocalStorage('settings-ollama-model', 'llama3.2');

  return (
    <div className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="settings-ollama-url">{$t('field-ollama-url')}</FieldLabel>
        <FieldContent>
          <Input
            id="settings-ollama-url"
            value={ollamaUrl}
            onChange={(event) => setOllamaUrl(event.target.value)}
            placeholder="http://localhost:11434"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="settings-ollama-model">{$t('field-ollama-model')}</FieldLabel>
        <FieldContent>
          <Input
            id="settings-ollama-model"
            value={ollamaModel}
            onChange={(event) => setOllamaModel(event.target.value)}
            placeholder="llama3.2"
          />
        </FieldContent>
      </Field>
    </div>
  );
}
