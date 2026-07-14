import { FaSave } from 'react-icons/fa';
import ModeToggle from '../ModeToggle';
import FilesDrawer from './FilesDrawer';
import MainContent from './MainContent';
import SnippetsDrawer from './SnippetsDrawer';
import { useAppProviderContext } from '../providers/AppProvider';
import { cn } from '@/lib/utils';
type LayoutProps = {
};

export default function LayoutApp({}: LayoutProps) {
  return (
    <div>
        <header className='bg-primary h-(--height-appbar) fixed w-screen flex justify-between items-center px-2'>
            <h1 className='text-xl text-white'>Snippets app</h1>
            <div className="flex flex-row gap-2">
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

function SaveButton() {
    const {saved} = useAppProviderContext()
    return (
        <FaSave className={cn(
            {
                'text-white text-2xl': saved,
                'text-red-500 text-2xl': !saved,
            }
        )} />
    )
}