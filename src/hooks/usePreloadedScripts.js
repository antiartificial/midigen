import { useState, useEffect } from 'react';

/**
 * Custom hook to preload scripts with fallback options
 * @param {Array} scripts - Array of script objects with { src, fallbackSrc, global }
 * @returns {Object} - Object containing loading status of scripts
 */
const usePreloadedScripts = (scripts) => {
  const [loadedScripts, setLoadedScripts] = useState({});

  useEffect(() => {
    const loadScript = async (scriptConfig) => {
      const { src, fallbackSrc, global } = scriptConfig;
      
      // Check if already loaded globally
      if (window[global]) {
        setLoadedScripts(prev => ({
          ...prev,
          [global]: true
        }));
        return;
      }
      
      try {
        // Try to load from primary source
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
        });
        
        document.body.appendChild(script);
        await loadPromise;
        
        setLoadedScripts(prev => ({
          ...prev,
          [global]: true
        }));
      } catch (error) {
        console.warn(`Failed to load script from ${src}, trying fallback...`);
        
        if (fallbackSrc) {
          try {
            // Try fallback source
            const fallbackScript = document.createElement('script');
            fallbackScript.src = fallbackSrc;
            fallbackScript.async = true;
            
            const fallbackLoadPromise = new Promise((resolve, reject) => {
              fallbackScript.onload = () => resolve();
              fallbackScript.onerror = () => reject(new Error(`Failed to load fallback ${fallbackSrc}`));
            });
            
            document.body.appendChild(fallbackScript);
            await fallbackLoadPromise;
            
            setLoadedScripts(prev => ({
              ...prev,
              [global]: true
            }));
          } catch (fallbackError) {
            console.error(`Failed to load script from fallback ${fallbackSrc}`);
            setLoadedScripts(prev => ({
              ...prev,
              [global]: false
            }));
          }
        } else {
          setLoadedScripts(prev => ({
            ...prev,
            [global]: false
          }));
        }
      }
    };
    
    scripts.forEach(loadScript);
  }, [scripts]);
  
  return loadedScripts;
};

export default usePreloadedScripts;