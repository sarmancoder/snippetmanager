import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useMemo, useState } from 'react';
import { useI18nProviderContext } from '@/I18nProvider';
import { listGoogleModels } from '@/lib/ai/google';

export default function GoogleTab() {
  const { $t } = useI18nProviderContext();
  const [googleModel, setGoogleModel] = useLocalStorage('settings-google-model', 'gemini-2.0-flash');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const [modelQuery, setModelQuery] = useState(googleModel);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadApiKey() {
      try {
        const storedKey = await invoke<string | null>('get_google_api_key');
        if (!isCancelled && storedKey) {
          setGoogleApiKey(storedKey);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!isCancelled) {
          setIsKeyLoaded(true);
        }
      }
    }

    loadApiKey();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setModelQuery(googleModel);
  }, [googleModel]);

  useEffect(() => {
    let isCancelled = false;

    if (!googleApiKey) {
      setAvailableModels([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoadingModels(true);
      try {
        const models = await listGoogleModels(googleApiKey);
        if (!isCancelled) {
          setAvailableModels(models);
        }
      } catch (error) {
        if (!isCancelled) {
          setAvailableModels([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingModels(false);
        }
      }
    }, 500);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [googleApiKey]);

  const isModelSelectorDisabled = !isKeyLoaded || !googleApiKey;

  const filteredModels = useMemo(() => {
    const normalizedQuery = modelQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableModels.slice(0, 10);
    }

    return availableModels.filter((model) => model.toLowerCase().includes(normalizedQuery)).slice(0, 10);
  }, [availableModels, modelQuery]);

  async function handleApiKeyChange(value: string) {
    setGoogleApiKey(value);
    try {
      await invoke('save_google_api_key', { apiKey: value });
    } catch (error) {
      console.log(error);
    }
  }

  function handleSelectModel(model: string) {
    setModelQuery(model);
    setGoogleModel(model);
    setShowModelSuggestions(false);
  }

  return (
    <div className="grid gap-4">
      <Field>
        <FieldLabel htmlFor="settings-google-key">{$t('field-google-api-key')}</FieldLabel>
        <FieldContent>
          <Input
            id="settings-google-key"
            type="password"
            value={googleApiKey}
            disabled={!isKeyLoaded}
            onChange={(event) => handleApiKeyChange(event.target.value)}
            placeholder="AIza..."
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="settings-google-model">{$t('field-google-model')}</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="settings-google-model"
              value={modelQuery}
              disabled={isModelSelectorDisabled}
              onChange={(event) => {
                const nextValue = event.target.value;
                setModelQuery(nextValue);
                setGoogleModel(nextValue);
                setShowModelSuggestions(true);
              }}
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowModelSuggestions(false), 120)}
              placeholder="gemini-2.0-flash"
            />

            {showModelSuggestions && !isModelSelectorDisabled && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                {isLoadingModels ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{$t('status-loading-models')}</div>
                ) : filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <button
                      key={model}
                      type="button"
                      className="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-muted"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelectModel(model);
                      }}
                    >
                      {model}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{$t('message-no-models-found')}</div>
                )}
              </div>
            )}
          </div>
        </FieldContent>
      </Field>
    </div>
  );
}
