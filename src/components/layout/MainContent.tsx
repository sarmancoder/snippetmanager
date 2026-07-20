import { cn } from "@/lib/utils";
import DualEditor from "../DualEditor/DualEditor";
import { useAppProviderContext } from "../providers/AppProvider";
import { useI18nProviderContext } from "@/I18nProvider";
import { Button } from "../ui/button";
import { invoke } from '@tauri-apps/api/core';

type MainContentProps = {
};

export default function MainContent({ }: MainContentProps) {
    const { $t } = useI18nProviderContext()
    const { dualEditorRef, areEqual, selectedSnippet, setSaved, adjust } = useAppProviderContext()

    async function pedirSnippetAOllama() {
        try {
            const promptUsuario = 'Quiero que me hagas un snippet que sea un vfor en vuejs, quiero tambien que tengo un vif y un velse'
            // Invocas el comando y esperas el String con el JSON del snippet terminado
            const snippetJsonString = await invoke<string>("stream_ollama_prompt", { prompt: promptUsuario, model: 'llama3' });

            // Como le pedimos formato estricto a Ollama, puedes parsearlo directo si quieres
            const objetoSnippet = JSON.parse(snippetJsonString);
            console.log("Tu snippet listo:", objetoSnippet);

        } catch (error) {
            console.error("Hubo un error en la petición:", error);
        }
    }

    return (
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                <div className={cn({ 'hidden': !selectedSnippet.key, 'block': selectedSnippet.key })}>
                    <DualEditor adjust={adjust} ref={dualEditorRef} onChange={(c) => {
                        setTimeout(() => {
                            setSaved(areEqual())
                        }, 100);
                    }} />
                </div>
                <div className={cn('flex flex-col mt-20 align-middle', { 'hidden': selectedSnippet.key, 'block': !selectedSnippet.key })}>
                    <h2 className="text-5xl text-center">{$t('message-nosnippetopened')}</h2>
                    <Button onClick={async () => {
                        pedirSnippetAOllama()
                    }}>Prooba</Button>
                </div>
            </div>
        </main>
    );
}