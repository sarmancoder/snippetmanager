import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { useI18nProviderContext } from '@/I18nProvider';

export default function GeneralTab() {
  const { $t, setLang, lang, languagesAvailable } = useI18nProviderContext();

  return (
    <div className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="settings-language">{$t('text-language')}</FieldLabel>
        <FieldContent>
          <select
            id="settings-language"
            value={lang}
            onChange={(event) => setLang(event.target.value as 'es-ES' | 'en-UK')}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {languagesAvailable.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </FieldContent>
      </Field>
    </div>
  );
}
