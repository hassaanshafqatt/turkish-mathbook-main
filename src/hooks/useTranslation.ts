import { getLanguage } from "@/components/SettingsDialog";

const translations = {
  en: {
    // Main page
    title: "MathBook Content Generator",
    subtitle:
      "Generate interactive mathbook content with custom typography and AI narration",
    footer: "AI-Powered Math Education • Processed via n8n",

    // Settings
    settings: "Settings",
    settingsDescription: "Configure your application settings",
    webhook: "Webhook",
    voices: "Voices",
    language: "Language",

    // Webhook tab
    webhookUrl: "n8n Webhook URL",
    webhookPlaceholder: "https://your-n8n-instance.com/webhook/...",
    webhookDescription: "n8n webhook endpoint for processing mathbook content",
    saveWebhook: "Save Webhook",
    addNewWebhook: "Add New Webhook",
    webhookName: "Webhook Name (e.g. Production)",
    webhookUrlLabel: "Webhook URL (https://...)",
    addWebhookButton: "Add Webhook",
    savedWebhooks: "Saved Webhooks",
    noWebhooksConfigured: "No webhooks configured",
    activeWebhook: "Active",
    setActive: "Set Active",
    deleteWebhook: "Delete",

    // Voices tab
    voiceIdPlaceholder: "Voice ID (e.g., 9BWtsMINqrJLrRacOk9x)",
    voiceNamePlaceholder: "Voice Name (e.g., Aria)",
    addVoice: "Add Voice",
    noVoicesConfigured:
      "No voices configured. Add voices to see them in the selector.",

    // Language tab
    selectLanguage: "Select Language",
    english: "English",
    turkish: "Türkçe",
    languageDescription: "Application language will be changed",

    // Form
    uploadLabel: "Upload PDF Document",
    dragDropText: "Drag and drop a PDF file here, or click to select",
    selectedFile: "Selected file:",
    removeFile: "Remove",
    fontLabel: "Select Font",
    searchFonts: "Search fonts...",
    noFontsFound: "No fonts found.",
    loadingFonts: "Loading fonts...",
    voiceLabel: "Select Narration Voice",
    chooseVoice: "Choose a voice",
    noVoicesInSelector: "No voices configured. Please add voices in settings.",
    voiceDescription: "AI voice for explaining math concepts and narration",
    generateButton: "Generate MathBook Content",
    generating: "Generating Content...",

    // Animation Settings
    animationSettings: "Animation Settings",
    showHandAnimation: "Show Hand Animation",
    showHandAnimationDesc: "Display hand writing animation",
    showOptionsAnimation: "Show Options Animation",
    showOptionsAnimationDesc: "Animate the appearance of options",

    // Background Color
    backgroundColorLabel: "Background Color",
    backgroundColorDescription: "Select the background color for your content",
    selectColor: "Select color",
    color_white: "White",
    color_light_blue: "Light Blue",
    color_light_yellow: "Light Yellow",
    color_gray: "Gray",

    // Voice Instructions
    voiceInstructionsLabel: "Voice Generation Instructions",
    voiceInstructionsPlaceholder:
      "Enter any specific instructions for voice generation (e.g., tone, pacing, emphasis)...",
    voiceInstructionsDescription:
      "Optional instructions to guide the AI voice narration",
    optional: "Optional",

    // Uploaded Books
    uploadedBooksTitle: "Your Uploaded Books",
    noBooksUploaded: "No books uploaded yet",
    fetchBooksError: "Failed to load books. Please try again later.",
    noBooksWebhookConfigured: "Books webhook not configured in environment",

    // Quick Tips
    quickTips: "Quick Tips",
    quickTip1: "Choose fonts that are clear and readable",
    quickTip2: "Select a voice that matches your audience",
    quickTip3: "Background colors affect readability",
    quickTip4: "Voice instructions help customize narration",

    // Toasts
    uploadPdfError: "Please upload a PDF file",
    selectFontError: "Please enter a Font",
    selectVoiceError: "Please select a voice",
    configureWebhookError: "Please configure webhook URL in settings",
    submitSuccess: "Mathbook generation request submitted successfully!",
    submitError: "Failed to submit request. Please try again.",
    webhookUrlError: "Please enter a webhook URL",
    webhookSaved: "Webhook saved",
    voiceAddError: "Please enter both voice ID and name",
    voiceAdded: "Voice added",
    voiceRemoved: "Voice removed",
    languageSaved: "Language saved",
  },
  tr: {
    // Ana sayfa
    title: "MathBook İçerik Oluşturucu",
    subtitle:
      "Özel tipografi ve yapay zeka anlatımıyla interaktif matematik kitabı içeriği oluşturun",
    footer: "Yapay Zeka Destekli Matematik Eğitimi • n8n ile İşleniyor",

    // Ayarlar
    settings: "Ayarlar",
    settingsDescription: "Uygulama ayarlarınızı yapılandırın",
    webhook: "Webhook",
    voices: "Sesler",
    language: "Dil",

    // Webhook sekmesi
    webhookUrl: "n8n Webhook URL",
    webhookPlaceholder: "https://your-n8n-instance.com/webhook/...",
    webhookDescription:
      "Matematik kitabı içeriğini işlemek için n8n webhook adresi",
    saveWebhook: "Webhook'u Kaydet",
    addNewWebhook: "Yeni Webhook Ekle",
    webhookName: "Webhook Adı (örn. Üretim)",
    webhookUrlLabel: "Webhook URL (https://...)",
    addWebhookButton: "Webhook Ekle",
    savedWebhooks: "Kayıtlı Webhook'lar",
    noWebhooksConfigured: "Yapılandırılmış webhook yok",
    activeWebhook: "Aktif",
    setActive: "Aktif Yap",
    deleteWebhook: "Sil",

    // Sesler sekmesi
    voiceIdPlaceholder: "Ses ID (örn: 9BWtsMINqrJLrRacOk9x)",
    voiceNamePlaceholder: "Ses Adı (örn: Aria)",
    addVoice: "Ses Ekle",
    noVoicesConfigured:
      "Yapılandırılmış ses yok. Seçicide görmek için sesler ekleyin.",

    // Dil sekmesi
    selectLanguage: "Dil Seçin",
    english: "English",
    turkish: "Türkçe",
    languageDescription: "Uygulama dili değiştirilecek",

    // Form
    uploadLabel: "PDF Belgesi Yükle",
    dragDropText:
      "Bir PDF dosyasını buraya sürükleyip bırakın veya seçmek için tıklayın",
    selectedFile: "Seçilen dosya:",
    removeFile: "Kaldır",
    fontLabel: "Font Seç",
    searchFonts: "Font ara...",
    noFontsFound: "Font bulunamadı.",
    loadingFonts: "Fontlar yükleniyor...",
    voiceLabel: "Anlatım Sesi Seç",
    chooseVoice: "Bir ses seçin",
    noVoicesInSelector:
      "Yapılandırılmış ses yok. Lütfen ayarlardan ses ekleyin.",
    voiceDescription:
      "Matematik kavramlarını açıklamak ve anlatım için yapay zeka sesi",
    generateButton: "MathBook İçeriği Oluştur",
    generating: "İçerik Oluşturuluyor...",

    // Animasyon Ayarları
    animationSettings: "Animasyon Ayarları",
    showHandAnimation: "El Animasyonunu Göster",
    showHandAnimationDesc: "El yazısı animasyonunu göster",
    showOptionsAnimation: "Seçenek Animasyonunu Göster",
    showOptionsAnimationDesc: "Seçeneklerin görünüm animasyonu",

    // Arka Plan Rengi
    backgroundColorLabel: "Arka Plan Rengi",
    backgroundColorDescription: "İçeriğiniz için arka plan rengini seçin",
    selectColor: "Renk seç",
    color_white: "Beyaz",
    color_light_blue: "Açık Mavi",
    color_light_yellow: "Açık Sarı",
    color_gray: "Gri",

    // Ses Talimatları
    voiceInstructionsLabel: "Ses Oluşturma Talimatları",
    voiceInstructionsPlaceholder:
      "Ses oluşturma için özel talimatlar girin (örn: ton, hız, vurgu)...",
    voiceInstructionsDescription:
      "Yapay zeka ses anlatımını yönlendirmek için isteğe bağlı talimatlar",
    optional: "İsteğe Bağlı",

    // Yüklenen Kitaplar
    uploadedBooksTitle: "Yüklediğiniz Kitaplar",
    noBooksUploaded: "Henüz kitap yüklenmemiş",
    fetchBooksError: "Kitaplar yüklenemedi. Lütfen daha sonra tekrar deneyin.",
    noBooksWebhookConfigured:
      "Kitap webhook'u ortam değişkenlerinde yapılandırılmamış",

    // Hızlı İpuçları
    quickTips: "Hızlı İpuçları",
    quickTip1: "Açık ve okunabilir fontlar seçin",
    quickTip2: "Hedef kitlenize uygun bir ses seçin",
    quickTip3: "Arka plan renkleri okunabilirliği etkiler",
    quickTip4: "Ses talimatları anlatımı özelleştirmeye yardımcı olur",

    // Bildirimler
    uploadPdfError: "Lütfen bir PDF dosyası yükleyin",
    selectFontError: "Lütfen bir Font girin",
    selectVoiceError: "Lütfen bir ses seçin",
    configureWebhookError: "Lütfen ayarlardan webhook URL'sini yapılandırın",
    submitSuccess: "Matematik kitabı oluşturma isteği başarıyla gönderildi!",
    submitError: "İstek gönderilemedi. Lütfen tekrar deneyin.",
    webhookUrlError: "Lütfen bir webhook URL'si girin",
    webhookSaved: "Webhook kaydedildi",
    voiceAddError: "Lütfen hem ses ID'sini hem de adını girin",
    voiceAdded: "Ses eklendi",
    voiceRemoved: "Ses kaldırıldı",
    languageSaved: "Dil kaydedildi",
  },
};

export const useTranslation = () => {
  const lang = getLanguage() as keyof typeof translations;
  return translations[lang] || translations.en;
};
