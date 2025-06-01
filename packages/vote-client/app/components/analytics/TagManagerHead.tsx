import { preinit } from 'react-dom';

export function TagManagerHead() {
    if (!import.meta.env.VITE_GTM_ID) {
        return <script>{`window.dataLayer = window.dataLayer || [];`}</script>;
    }

    const scriptUrl = `https://www.googletagmanager.com/gtm.js?id=${
        import.meta.env.VITE_GTM_ID
    }`;

    preinit(scriptUrl, { as: 'script' });

    return (
        <>
            <script>
                {`
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
                `}
            </script>
            <script async src={scriptUrl} />
        </>
    );
}
