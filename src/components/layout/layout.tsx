import { cn } from '@/lib/utils';
import { FaSave } from 'react-icons/fa';
import { MdWrapText } from 'react-icons/md';
import ModeToggle from '../ModeToggle';
import { useAppProviderContext } from '../providers/AppProvider';
import FilesDrawer from './FilesDrawer';
import MainContent from './MainContent';
import SnippetsDrawer from './SnippetsDrawer';

type LayoutProps = {
};

export default function LayoutApp({ }: LayoutProps) {
    return (
        <div>
            <header className='bg-primary h-(--height-appbar) fixed w-screen flex justify-between items-center px-2'>
                <h1 className='text-xl text-white'>Snippets app</h1>
                <div className="flex flex-row gap-2">
                    <AdjustButton />
                    <SaveButton />
                    <ModeToggle />
                </div>
            </header>
            <FilesDrawer />
            <SnippetsDrawer />
            <MainContent />
        </div>
    );
}

function AdjustButton() {
    const { setAdjust, adjust } = useAppProviderContext()
    return (
        <MdWrapText onClick={() => {
            setAdjust(!adjust)
        }} className={'text-2xl text-white cursor-pointer'} />
    )
}

function SaveButton() {
    const { saved, save } = useAppProviderContext()
    return (
        <FaSave onClick={() => {
            if (saved) return
            save()
        }} className={cn(
            {
                'text-white text-2xl': saved,
                'text-red-500 text-2xl cursor-pointer': !saved,
            }
        )} />
    )
}