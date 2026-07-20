import { cn } from "@/lib/utils";
import DualEditor from "../DualEditor/DualEditor";
import { useAppProviderContext } from "../providers/AppProvider";
import { useI18nProviderContext } from "@/I18nProvider";
import FabAi from "./FabAi";

type MainContentProps = {
};

export default function MainContent({ }: MainContentProps) {
    const { $t } = useI18nProviderContext()
    const { dualEditorRef, areEqual, selectedSnippet, setSaved, adjust } = useAppProviderContext()

    return (
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                <div className={cn({ 'hidden': !selectedSnippet.key, 'block': selectedSnippet.key })}>
                    <DualEditor adjust={adjust} ref={dualEditorRef} onChange={(c) => {
                        setTimeout(() => {
                            setSaved(areEqual())
                        }, 100);
                    }} />
                    <FabAi />
                </div>
                <div className={cn('flex flex-col mt-20 align-middle', { 'hidden': selectedSnippet.key, 'block': !selectedSnippet.key })}>
                    <h2 className="text-5xl text-center">{$t('message-nosnippetopened')}</h2>
                </div>
            </div>
        </main>
    );
}