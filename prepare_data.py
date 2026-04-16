from datasets import load_dataset
import json

# 1. Verisetini yükle
print("Veriseti indiriliyor...")
dataset = load_dataset("furkanali/psychology-dialogs-turkish")

# 2. Sistem talimatını belirle (Plandaki gibi)
SYSTEM_PROMPT = "Sen empatik bir yapay zeka yalnızlık danışmanısın. Kullanıcıların duygularını anlamaya çalışır, aktif dinleme yapar ve onlara bilişsel davranışçı terapi (CBT) prensipleriyle yaklaşarak destek olursun."

def format_data(example):
    # Verisetindeki 'messages' sütununu kontrol et
    # Bu veriseti genellikle [{'role': 'user', 'content': '...'}, {'role': 'assistant', 'content': '...'}] yapısındadır
    messages = example['messages']
    
    formatted_rows = []
    
    # Her bir kullanıcı-asistan çiftini bir eğitim örneği olarak ayırıyoruz
    # Plandaki {"system": "...", "user": "...", "assistant": "..."} formatına çeviriyoruz
    for i in range(len(messages) - 1):
        if messages[i]['role'] == 'user' and messages[i+1]['role'] == 'assistant':
            formatted_rows.append({
                "system": SYSTEM_PROMPT,
                "user": messages[i]['content'],
                "assistant": messages[i+1]['content']
            })
    return formatted_rows

print("Veriler dönüştürülüyor...")
all_formatted_data = []

# Tüm veriler üzerinde dön (train setini kullanıyoruz)
for example in dataset['train']:
    all_formatted_data.extend(format_data(example))

# 3. JSONL olarak kaydet
output_file = "psychology_dataset_v1.jsonl"
with open(output_file, 'w', encoding='utf-8') as f:
    for entry in all_formatted_data:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')

print(f"İşlem tamam! {len(all_formatted_data)} adet örnek {output_file} dosyasına kaydedildi.")
