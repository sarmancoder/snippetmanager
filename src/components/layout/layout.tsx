import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import {FaSave} from 'react-icons/fa'
type LayoutProps = {
  children: ReactNode;
};

export default function LayoutApp({ children }: LayoutProps) {
  return (
    <div>
        <header className='bg-primary h-(--height-appbar) fixed w-screen flex justify-between items-center px-2'>
            <h1 className='text-xl text-white'>Snippets app</h1>
            <div className="flex flex-row gap-2">
                <SaveButton />
            </div>
        </header>
        <aside className={cn('p-2',
                'fixed bottom-0 top-(--height-appbar) w-(--drawer-width) left-0',
                'bg-(--color-sidebar-primary)'
            )}>
            <p>Aside left</p>
        </aside>
        <aside className={cn('p-2',
                'fixed bottom-0 top-(--height-appbar) w-(--drawer-width) right-0',
                'bg-(--color-sidebar-primary)'
            )}>
            <p>Aside right</p>
        </aside>
        <main className='fixed top-(--height-appbar) left-(--drawer-width) right-(--drawer-width)'>
            <div className="p-2">
                {children}
            </div>
        </main>
    </div>
  );
}

function SaveButton() {
    return (
        <FaSave className='text-white text-2xl' />
    )
}