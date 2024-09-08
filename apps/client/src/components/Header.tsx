import { VscGithubInverted } from 'react-icons/vsc';

import { Link, Navbar, NavbarContent } from '@nextui-org/react';

export default function Header() {
    return (
        <Navbar maxWidth="2xl" className='mb-10'>
            <NavbarContent as="div" justify="end">
                <Link
                    href='https://github.com/joelson-c/my-planit-poker'
                    target='_blank'
                    rel='noopener'
                    aria-label="GitHub Repository"
                    color='foreground'
                    underline='none'
                >
                    Star me <VscGithubInverted className="ml-2 w-8 h-8" />
                </Link>
            </NavbarContent>
        </Navbar>
    );
}
