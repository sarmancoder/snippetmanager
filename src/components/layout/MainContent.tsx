import DualEditor from "../DualEditor/DualEditor";

type MainContentProps = {
};

export default function MainContent({ }: MainContentProps) {
    return (
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                <DualEditor />
            </div>
        </main>
    );
}