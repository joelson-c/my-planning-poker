export function TagManagerFooter() {
    if (!import.meta.env.VITE_GTM_ID) {
        return;
    }

    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${
                    import.meta.env.VITE_GTM_ID
                }`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
                title="GTM"
            ></iframe>
        </noscript>
    );
}
