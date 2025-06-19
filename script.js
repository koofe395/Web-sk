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
    // Fallback language list in case API fails
    this.languages = [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "de", name: "German" },
      { code: "it", name: "Italian" },
      { code: "pt", name: "Portuguese" },
      { code: "ru", name: "Russian" },
      { code: "ja", name: "Japanese" },
      { code: "ko", name: "Korean" },
      { code: "zh", name: "Chinese" },
      { code: "ar", name: "Arabic" },
      { code: "hi", name: "Hindi" },
      { code: "tr", name: "Turkish" },
      { code: "pl", name: "Polish" },
      { code: "nl", name: "Dutch" },
      { code: "sv", name: "Swedish" },
      { code: "da", name: "Danish" },
      { code: "no", name: "Norwegian" },
      { code: "fi", name: "Finnish" },
      { code: "el", name: "Greek" },
      { code: "he", name: "Hebrew" },
      { code: "th", name: "Thai" },
      { code: "vi", name: "Vietnamese" },
      { code: "id", name: "Indonesian" },
      { code: "ms", name: "Malay" },
      { code: "tl", name: "Filipino" },
      { code: "sw", name: "Swahili" },
      { code: "so", name: "Somali" },
      { code: "am", name: "Amharic" },
      { code: "yo", name: "Yoruba" },
      { code: "ig", name: "Igbo" },
      { code: "ha", name: "Hausa" },
      { code: "zu", name: "Zulu" },
      { code: "af", name: "Afrikaans" },
      { code: "sq", name: "Albanian" },
      { code: "az", name: "Azerbaijani" },
      { code: "be", name: "Belarusian" },
      { code: "bn", name: "Bengali" },
      { code: "bs", name: "Bosnian" },
      { code: "bg", name: "Bulgarian" },
      { code: "ca", name: "Catalan" },
      { code: "hr", name: "Croatian" },
      { code: "cs", name: "Czech" },
      { code: "et", name: "Estonian" },
      { code: "fa", name: "Persian" },
      { code: "ga", name: "Irish" },
      { code: "is", name: "Icelandic" },
      { code: "lv", name: "Latvian" },
      { code: "lt", name: "Lithuanian" },
      { code: "mk", name: "Macedonian" },
      { code: "mt", name: "Maltese" },
      { code: "ro", name: "Romanian" },
      { code: "sr", name: "Serbian" },
      { code: "sk", name: "Slovak" },
      { code: "sl", name: "Slovenian" },
      { code: "uk", name: "Ukrainian" },
      { code: "ur", name: "Urdu" },
    ]
    this.populateLanguageDropdowns()
  }

  populateLanguageDropdowns() {
    const fromSelect = document.getElementById("fromLanguage")
    const toSelect = document.getElementById("toLanguage")

    // Sort languages alphabetically
    const sortedLanguages = this.languages.sort((a, b) => a.name.localeCompare(b.name))

    // Populate "To" dropdown
    sortedLanguages.forEach((lang) => {
      const option = document.createElement("option")
      option.value = lang.code
      option.textContent = lang.name
      toSelect.appendChild(option)
    })

    // Populate "From" dropdown (excluding auto-detect)
    sortedLanguages.forEach((lang) => {
      const option = document.createElement("option")
      option.value = lang.code
      option.textContent = lang.name
      fromSelect.appendChild(option)
    })

    // Set default values
    toSelect.value = "en" // Default to English
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
