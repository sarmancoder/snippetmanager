import { useI18nProviderContext } from "@/I18nProvider";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { FaBrain } from "react-icons/fa";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

type ProviderOption = "ollama" | "openrouter";

const MODEL_OPTIONS: Array<{ value: ProviderOption; labelKey: string }> = [
    { value: "ollama", labelKey: "option-ollama" },
    { value: "openrouter", labelKey: "option-openrouter" },
];

export default function FabAi() {
    const { $t } = useI18nProviderContext();
    const [prompt, setPrompt] = useState("");
    const [provider, setProvider] = useState<ProviderOption>("ollama");
    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLFormElement | null>(null);
    const [unable, setUnable] = useState(false)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            console.log('cerrando mdal', unable)
            if (open && popoverRef.current && !popoverRef.current.contains(event.target as Node) && !unable) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, unable]);

    async function process(action: 'replace' | 'modify') {
        console.log('accion:', action)
        const fd = new FormData(popoverRef.current as any)
        const data = Object.fromEntries(fd)

        try {
            setUnable(true)
            const dataAiString = await invoke('stream_ollama_prompt', {
                prompt: data.prompt,
                model: 'llama3'
            })
            const dataAi = JSON.parse(dataAiString as string)
            console.log(dataAi)
        } catch (error) {
            console.log(error)
        } finally {
            setUnable(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-[calc(var(--drawer-width)_+_20px)] z-50">
            <div className="relative">
                <Button
                    aria-label={$t("button-open-fab")}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-primary text-white shadow-lg shadow-black/20 hover:bg-primary/90"
                    size="icon"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <FaBrain className="size-5" />
                </Button>

                {open ? (
                    <form
                        ref={popoverRef}
                        className="absolute bottom-20 right-0 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-border bg-popover p-4 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.35)]"
                    >
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground">{$t("title-fab-card")}</h2>
                        </div>

                        <Card className="overflow-hidden bg-transparent shadow-none ring-0">
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="fab-prompt" className="text-sm font-medium text-foreground">
                                        {$t("inputlabel-textarea")}
                                    </label>
                                    <textarea
                                        id="fab-prompt"
                                        value={prompt}
                                        name='prompt'
                                        onChange={(event) => setPrompt(event.target.value)}
                                        className="min-h-[160px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                                    />
                                </div>

                                <fieldset className="space-y-3 rounded-xl border border-input bg-background p-3">
                                    <legend className="text-sm font-medium text-foreground">{$t("label-model-source")}</legend>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {MODEL_OPTIONS.map((option) => (
                                            <label
                                                key={option.value}
                                                className="inline-flex w-full cursor-pointer items-center gap-3 rounded-lg border border-input/50 bg-muted/50 px-3 py-2 text-sm transition-colors hover:border-ring hover:bg-muted"
                                            >
                                                <input
                                                    type="radio"
                                                    name="assistant-provider"
                                                    value={option.value}
                                                    checked={provider === option.value}
                                                    onChange={() => setProvider(option.value)}
                                                    className="h-4 w-4 accent-primary"
                                                />
                                                <span>{$t(option.labelKey as any)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            </CardContent>

                            <CardFooter className="justify-end gap-2 bg-transparent border-none p-0">
                                <Button disabled={unable} variant="outline" onClick={() => process('replace')}>
                                    {$t("button-replace")}
                                </Button>
                                <Button disabled={unable} onClick={() => process('modify')}>{$t("button-modify")}</Button>
                            </CardFooter>
                        </Card>
                    </form>
                ) : null}
            </div>
        </div>
    );
}
