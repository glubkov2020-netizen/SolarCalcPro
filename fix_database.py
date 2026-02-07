import sqlite3
import os

def fix_database():
    db_path = 'data/solar_calculations.db'
    
    if not os.path.exists(db_path):
        print(f"База данных не найдена: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Проверяем существование колонки language
    cursor.execute("PRAGMA table_info(calculations)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'language' not in columns:
        print("Добавляем колонку 'language' в таблицу 'calculations'...")
        cursor.execute('ALTER TABLE calculations ADD COLUMN language TEXT DEFAULT "ru"')
        conn.commit()
        print("✅ Колонка добавлена успешно!")
    else:
        print("✅ Колонка 'language' уже существует")
    
    # Показываем структуру таблицы
    print("\n📋 Структура таблицы calculations:")
    cursor.execute("PRAGMA table_info(calculations)")
    for col in cursor.fetchall():
        print(f"  {col[1]:20} {col[2]:15} {'NOT NULL' if col[3] else 'NULL':10} DEFAULT: {col[4]}")
    
    conn.close()
    print("\n✅ База данных исправлена!")

if __name__ == "__main__":
    fix_database()