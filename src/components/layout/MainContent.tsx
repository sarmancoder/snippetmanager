import DualEditor from "../DualEditor/DualEditor";
import { useAppProviderContext } from "../providers/AppProvider";

type MainContentProps = {
};

export default function MainContent({ }: MainContentProps) {
    const {dualEditorRef} = useAppProviderContext()
    return (
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                <DualEditor ref={dualEditorRef} />
            </div>
        </main>
    );
}