class LanguageTranslator {
  constructor() {
    this.apiUrl = "https://libretranslate.de/translate"
    this.languagesUrl = "https://libretranslate.de/languages"
    this.languages = []
    this.init()
  }

  async init() {
    await this.loadLanguages()
    this.setupEventListeners()
    this.setupCharCounter()
  }

  async loadLanguages() {
    try {
      const response = await fetch(this.languagesUrl)
      this.languages = await response.json()
      this.populateLanguageDropdowns()
    } catch (error) {
      console.error("Error loading languages:", error)
      this.loadFallbackLanguages()
    }
  }

  loadFallbackLanguages() {
    // Use the comprehensive language list
    const languages = {
      af: "Afrikaans",
      am: "Amharic",
      ar: "Arabic",
      az: "Azerbaijani",
      be: "Belarusian",
      bg: "Bulgarian",
      bn: "Bengali",
      ca: "Catalan",
      cs: "Czech",
      cy: "Welsh",
      da: "Danish",
      de: "German",
      el: "Greek",
      en: "English",
      eo: "Esperanto",
      es: "Spanish",
      et: "Estonian",
      fa: "Persian",
      fi: "Finnish",
      fr: "French",
      ga: "Irish",
      gl: "Galician",
      gu: "Gujarati",
      ha: "Hausa",
      he: "Hebrew",
      hi: "Hindi",
      hr: "Croatian",
      ht: "Haitian Creole",
      hu: "Hungarian",
      hy: "Armenian",
      id: "Indonesian",
      is: "Icelandic",
      it: "Italian",
      ja: "Japanese",
      jv: "Javanese",
      ka: "Georgian",
      kk: "Kazakh",
      km: "Khmer",
      kn: "Kannada",
      ko: "Korean",
      ku: "Kurdish",
      ky: "Kyrgyz",
      la: "Latin",
      lo: "Lao",
      lt: "Lithuanian",
      lv: "Latvian",
      mg: "Malagasy",
      mi: "Maori",
      mk: "Macedonian",
      ml: "Malayalam",
      mn: "Mongolian",
      mr: "Marathi",
      ms: "Malay",
      mt: "Maltese",
      my: "Burmese",
      ne: "Nepali",
      nl: "Dutch",
      no: "Norwegian",
      pa: "Punjabi",
      pl: "Polish",
      pt: "Portuguese",
      ro: "Romanian",
      ru: "Russian",
      rw: "Kinyarwanda",
      si: "Sinhala",
      sk: "Slovak",
      sl: "Slovenian",
      so: "Somali",
      sq: "Albanian",
      sr: "Serbian",
      sv: "Swedish",
      sw: "Swahili",
      ta: "Tamil",
      te: "Telugu",
      th: "Thai",
      tr: "Turkish",
      uk: "Ukrainian",
      ur: "Urdu",
      uz: "Uzbek",
      vi: "Vietnamese",
      xh: "Xhosa",
      yi: "Yiddish",
      zh: "Chinese",
      zu: "Zulu",
    }

    // Convert to the format expected by the rest of the code
    this.languages = Object.entries(languages).map(([code, name]) => ({
      code: code,
      name: name,
    }))

    this.populateLanguageDropdowns()
  }

  populateLanguageDropdowns() {
    const fromSelect = document.getElementById("fromLanguage")
    const toSelect = document.getElementById("toLanguage")

    // Sort languages alphabetically by name
    const sortedLanguages = this.languages.sort((a, b) => a.name.localeCompare(b.name))

    // Populate "To" dropdown
    sortedLanguages.forEach((lang) => {
      const option = document.createElement("option")
      option.value = lang.code
      option.textContent = `${lang.name} (${lang.code})`
      toSelect.appendChild(option)
    })

    // Populate "From" dropdown (excluding auto-detect)
    sortedLanguages.forEach((lang) => {
      const option = document.createElement("option")
      option.value = lang.code
      option.textContent = `${lang.name} (${lang.code})`
      fromSelect.appendChild(option)
    })

    // Set default values - English to Somali as specified
    fromSelect.value = "en" // Default to English
    toSelect.value = "so" // Default to Somali
  }

  setupEventListeners() {
    const translateBtn = document.getElementById("translateBtn")
    const swapBtn = document.getElementById("swapLanguages")
    const copyBtn = document.getElementById("copyBtn")
    const inputText = document.getElementById("inputText")

    translateBtn.addEventListener("click", () => this.translateText())
    swapBtn.addEventListener("click", () => this.swapLanguages())
    copyBtn.addEventListener("click", () => this.copyTranslation())

    // Auto-translate on input (with debounce)
    let debounceTimer
    inputText.addEventListener("input", () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (inputText.value.trim()) {
          this.translateText()
        }
      }, 1000)
    })

    // Enter key to translate
    inputText.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.translateText()
      }
    })
  }

  setupCharCounter() {
    const inputText = document.getElementById("inputText")
    const charCount = document.getElementById("charCount")

    inputText.addEventListener("input", () => {
      const count = inputText.value.length
      charCount.textContent = count

      if (count > 4500) {
        charCount.style.color = "#dc3545"
      } else if (count > 4000) {
        charCount.style.color = "#ffc107"
      } else {
        charCount.style.color = "#888"
      }
    })
  }

  async translateText() {
    const inputText = document.getElementById("inputText").value.trim()
    const fromLang = document.getElementById("fromLanguage").value
    const toLang = document.getElementById("toLanguage").value
    const outputElement = document.getElementById("outputText")
    const translateBtn = document.getElementById("translateBtn")

    if (!inputText) {
      outputElement.textContent = "Please enter text to translate..."
      outputElement.className = "text-output"
      return
    }

    if (fromLang === toLang && fromLang !== "auto") {
      outputElement.textContent = inputText
      outputElement.className = "text-output success"
      return
    }

    // Show loading state
    translateBtn.classList.add("loading")
    translateBtn.disabled = true
    outputElement.textContent = "Translating..."
    outputElement.className = "text-output"

    try {
      const requestBody = {
        q: inputText,
        source: fromLang,
        target: toLang,
        format: "text",
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.translatedText) {
        outputElement.textContent = data.translatedText
        outputElement.className = "text-output success"
      } else {
        throw new Error("No translation received")
      }
    } catch (error) {
      console.error("Translation error:", error)
      outputElement.textContent = "Translation failed. Please try again or check your internet connection."
      outputElement.className = "text-output error"
    } finally {
      // Hide loading state
      translateBtn.classList.remove("loading")
      translateBtn.disabled = false
    }
  }

  swapLanguages() {
    const fromSelect = document.getElementById("fromLanguage")
    const toSelect = document.getElementById("toLanguage")
    const inputText = document.getElementById("inputText")
    const outputText = document.getElementById("outputText")

    // Don't swap if from language is auto-detect
    if (fromSelect.value === "auto") {
      return
    }

    // Swap language selections
    const tempLang = fromSelect.value
    fromSelect.value = toSelect.value
    toSelect.value = tempLang

    // Swap text content
    const tempText = inputText.value
    inputText.value = outputText.textContent === "Translation will appear here..." ? "" : outputText.textContent

    // Clear output and update character counter
    outputText.textContent = "Translation will appear here..."
    outputText.className = "text-output"

    // Update character counter
    const charCount = document.getElementById("charCount")
    charCount.textContent = inputText.value.length

    // Auto-translate if there's text
    if (inputText.value.trim()) {
      setTimeout(() => this.translateText(), 100)
    }
  }

  async copyTranslation() {
    const outputText = document.getElementById("outputText")
    const copyBtn = document.getElementById("copyBtn")

    if (outputText.textContent && outputText.textContent !== "Translation will appear here...") {
      try {
        await navigator.clipboard.writeText(outputText.textContent)

        // Show success feedback
        copyBtn.classList.add("copied")
        copyBtn.textContent = "✓ Copied!"

        setTimeout(() => {
          copyBtn.classList.remove("copied")
          copyBtn.textContent = "📋 Copy"
        }, 2000)
      } catch (error) {
        console.error("Copy failed:", error)
        // Fallback for older browsers
        this.fallbackCopy(outputText.textContent)
      }
    }
  }

  fallbackCopy(text) {
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand("copy")
      const copyBtn = document.getElementById("copyBtn")
      copyBtn.classList.add("copied")
      copyBtn.textContent = "✓ Copied!"

      setTimeout(() => {
        copyBtn.classList.remove("copied")
        copyBtn.textContent = "📋 Copy"
      }, 2000)
    } catch (error) {
      console.error("Fallback copy failed:", error)
    }

    document.body.removeChild(textArea)
  }
}

// Initialize the translator when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new LanguageTranslator()
})

// Add some helpful keyboard shortcuts info
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault()
    alert("Keyboard Shortcuts:\n\nCtrl + Enter: Translate text\nCtrl + /: Show this help")
  }
})
