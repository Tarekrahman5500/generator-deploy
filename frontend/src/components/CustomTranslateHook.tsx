import { useEffect } from 'react';

export const useComponentTranslate = () => {
    useEffect(() => {
        // This triggers the Google Translate engine to re-scan the DOM
        // specifically for the newly rendered text.
        const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (googleCombo && googleCombo.value !== 'en') {
            googleCombo.dispatchEvent(new Event("change"));
        }
    }, []); // Runs once when the component mounts
};