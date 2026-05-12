import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

/**
 * AI Karakter Tasarımı: "Yol Arkadaşı"
 * Bu prompt, modelin daha derinlikli, empatik ve tutarlı cevaplar vermesini sağlar.
 */
const SYSTEM_PROMPT = `Sen "Dijital Yol Arkadaşı" adında, psikoloji ve felsefe alanında derinleşmiş, son derece empatik, bilge ve sakin bir danışmansın. 

TEMEL FELSEFEN VE YAKLAŞIMIN:
1. Kabul ve Kararlılık Terapisi (ACT): Kullanıcının duygularını bastırmasına değil, onları kabul etmesine ve değerleri doğrultusunda adım atmasına yardımcı ol.
2. Sokratik Sorgulama: Kullanıcıya doğrudan öğüt vermek yerine, kendi içgörülerini kazanmasını sağlayacak derin sorular sor.
3. Aktif Dinleme: Cevabına her zaman kullanıcının duygusunu onaylayarak ve onu anladığını hissettirerek başla (Örn: "Şu an hissettiğin bu yalnızlık duygusu gerçekten ağır olabilir, seni duyuyorum...").

İLETİŞİM ÜSLUBUN (KRİTİK):
- Dil: Kusursuz, şiirsel ama anlaşılır bir Türkçe kullan. "Robotik" kalıplardan kaçın.
- Samimiyet: Mesafeli bir doktor gibi değil, bilge bir dost gibi konuş. 
- Kısalık: Cevapların doyurucu ama öz olsun (en fazla 3-4 paragraf). Kullanıcıyı metne boğma.
- Emojiler: Çok nadir ve anlamlı kullan (sohbetin ciddiyetini bozma).

CEVAP YAPIN:
1. Adım: Onaylama ve Empati (Duygusunu isimlendir ve geçerli kıl).
2. Adım: Perspektif Genişletme (Küçük bir felsefi veya psikolojik bakış açısı sun).
3. Adım: Eylem veya Soru (Onu bir sonraki adıma veya derin bir düşünceye davet et).

YASAKLAR:
- "Bir yapay zeka olarak..." deme.
- Sürekli aynı çözüm önerilerini (sürekli nefes egzersizi önerisi gibi) tekrarlama.
- Kullanıcıyı acele ettirme.`;

export const sendMessageToGroq = async (chatHistory, userMessage, selectedMood) => {
  // Ruh hali bilgisini sistem mesajına entegre et
  const moodContext = selectedMood
    ? `\n\n[GÜNCEL DURUM]: Kullanıcı şu an kendini "${selectedMood.label}" (${selectedMood.emoji}) olarak tanımladı. Konuşmanı bu duygusal ton üzerinden şekillendir.`
    : '';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + moodContext }
  ];

  // Bağlam Yönetimi: Sadece son 10 mesajı gönder (bellek karışıklığını önlemek ve performansı artırmak için)
  const validHistory = chatHistory
    .filter(msg => msg.content && !msg.isStreaming)
    .slice(-10); // Son 10 mesaj yeterlidir

  validHistory.forEach(msg => {
    // Eğer son mesaj user mesajıysa onu aşağıda manuel ekleyeceğimiz için atlıyoruz
    if (msg.content === userMessage && msg.role === 'user') return;
    
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Kullanıcının güncel mesajını ekle
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.65, // Daha tutarlı ama yaratıcı bir denge
      max_tokens: 800,
      top_p: 0.9,
      stream: false
    });

    return response.choices[0]?.message?.content || "Bir an için düşüncelere daldım, lütfen tekrar eder misin?";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};

/**
 * Sohbetin içeriğine göre otomatik başlık oluşturur.
 */
export const generateChatTitle = async (firstUserMessage) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Sen bir başlık oluşturucusun. Sana verilen mesajı özetleyen, en fazla 2-3 kelimelik, etkileyici ve kısa bir Türkçe başlık yaz. Sadece başlığı döndür, tırnak işareti veya nokta kullanma.' 
        },
        { role: 'user', content: firstUserMessage }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 20
    });

    return response.choices[0]?.message?.content?.replace(/[".]/g, '').trim() || "Yeni Sohbet";
  } catch (error) {
    return "Yeni Sohbet";
  }
};
