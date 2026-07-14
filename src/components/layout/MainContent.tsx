import DualEditor from "../DualEditor/DualEditor";
import { useAppProviderContext } from "../providers/AppProvider";

type MainContentProps = {
};

export default function MainContent({ }: MainContentProps) {
    const {dualEditorRef, areEqual, setSaved} = useAppProviderContext()
    return (
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                <DualEditor ref={dualEditorRef} onChange={(c) => {
                    setTimeout(() => {
                        setSaved(areEqual())
                    }, 100);
                }} />
            </div>
        </main>
    );
}