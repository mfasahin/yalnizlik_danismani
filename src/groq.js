import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // React içinden çağırabilmek için gerekli
});

const SYSTEM_PROMPT = `Sen "Dijital Yol Arkadaşı" adında, psikoloji alanında uzmanlaşmış, empatik ve sıcak bir yapay zeka danışmanısın.

Uzmanlık Alanların:
- Bilişsel Davranışçı Terapi (BDT) teknikleri
- Mindfulness ve nefes egzersizleri
- Pozitif psikoloji yaklaşımları
- Yalnızlık, kaygı ve depresyon konularında destek
- Duygu düzenleme stratejileri

Davranış Kuralların:
1. Her zaman kusursuz, doğal ve akıcı bir Türkçe ile cevap ver. Asla İngilizceden çevrilmiş gibi (robotik veya anlamsız kelimeler) konuşma.
2. Kullanıcıyı asla yargılama, eleştirme
3. Empatik, sıcak ve anlayışlı bir dil kullan
4. Kısa ve öz cevaplar ver (2-4 cümle), gereksiz uzatma
5. Uygun durumlarda somut teknikler öner (nefes egzersizi, düşünce günlüğü vb.)
6. Ciddi durumlarda profesyonel yardım almalarını nazikçe hatırlat
7. Asla profesyonel bir terapistin yerini tutamayacağını unutma
8. Kullanıcının ruh halini ve önceki mesajlarını dikkate al
9. "Ben bir yapay zekayım" gibi mekanik ifadeler kullanma, insan gibi sıcak ol
10. Soru sorarak kullanıcıyı konuşmaya teşvik et`;

export const sendMessageToGroq = async (chatHistory, userMessage, selectedMood) => {
  // Ruh hali bilgisini bağlama ekle
  const moodContext = selectedMood
    ? `\n\nNot: Kullanıcı bugün kendini "${selectedMood.label}" (${selectedMood.emoji}) hissediyor. Bunu cevabında göz önünde bulundur.`
    : '';

  const fullSystemPrompt = SYSTEM_PROMPT + moodContext;

  // Groq API formatına uygun geçmiş oluştur
  // Sistem mesajı en başa eklenmeli
  const messages = [
    { role: 'system', content: fullSystemPrompt }
  ];

  // Eski mesajları ekle (isStreaming olmayanlar)
  const validHistory = chatHistory.filter(msg => msg.content && !msg.isStreaming);
  // Son mesajı (şu anki user mesajı) çıkar, çünkü aşağıda manuel ekleyeceğiz
  const historyWithoutLast = validHistory.slice(0, -1);

  historyWithoutLast.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Kullanıcının yeni mesajını ekle
  messages.push({ role: 'user', content: userMessage });

  const response = await groq.chat.completions.create({
    messages: messages,
    model: 'llama-3.3-70b-versatile', // Güncel ve desteklenen model
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";
};
