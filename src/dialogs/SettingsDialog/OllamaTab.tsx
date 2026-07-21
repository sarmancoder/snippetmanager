import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useI18nProviderContext } from '@/I18nProvider';

export default function OllamaTab() {
  const { $t } = useI18nProviderContext();
  const [ollamaUrl, setOllamaUrl] = useLocalStorage('settings-ollama-url', 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useLocalStorage('settings-ollama-model', 'llama3.2');
  const [modelQuery, setModelQuery] = useState(ollamaModel);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadModels() {
      if (!ollamaUrl) return;

      setIsLoadingModels(true);
      try {
        const models = await invoke<string[]>('list_ollama_models', {
          baseUrl: ollamaUrl,
        });

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
    }

    loadModels();
    return () => {
      isCancelled = true;
    };
  }, [ollamaUrl]);

  useEffect(() => {
    setModelQuery(ollamaModel);
  }, [ollamaModel]);

  const filteredModels = useMemo(() => {
    const normalizedQuery = modelQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableModels.slice(0, 10);
    }

    return availableModels.filter((model) => model.toLowerCase().includes(normalizedQuery)).slice(0, 10);
  }, [availableModels, modelQuery]);

  function handleSelectModel(model: string) {
    setModelQuery(model);
    setOllamaModel(model);
    setShowModelSuggestions(false);
  }

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
          <div className="relative">
            <Input
              id="settings-ollama-model"
              value={modelQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                setModelQuery(nextValue);
                setOllamaModel(nextValue);
                setShowModelSuggestions(true);
              }}
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowModelSuggestions(false), 120)}
              placeholder="llama3.2"
            />

            {showModelSuggestions && (
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
