if (typeof window !== "undefined") {
    function googleTranslateElementInit() {
      new (window as any).google.translate.TranslateElement(
        { 
          pageLanguage: 'en', 
          includedLanguages: 'en,fr,de,ru,vi,hi,ja,zh-CN', 
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE 
        },
        'google_translate_element'
      );
    }
  
    function ensureGoogleTranslate() {
      const widgetContainer = document.getElementById("google_translate_element");
      if (!widgetContainer) {
        const header = document.querySelector("header");
        if (header) {
          const div = document.createElement("div");
          div.id = "google_translate_element";
          div.style.marginLeft = "auto";
          header.appendChild(div);
          googleTranslateElementInit();
        }
      }
    }
  
    (window as any).googleTranslateElementInit = googleTranslateElementInit;
  
    window.addEventListener("load", () => {
      ensureGoogleTranslate();
      setInterval(ensureGoogleTranslate, 2000);
    });
  
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  }