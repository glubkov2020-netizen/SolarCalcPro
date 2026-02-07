# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify, send_file, session
import json
import math
import sqlite3
import os
import io
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

app = Flask(__name__)
app.secret_key = 'solar_calc_pro_2024'

# ===== ИНИЦИАЛИЗАЦИЯ =====

def init_db():
    """Инициализация базы данных"""
    if not os.path.exists('data'):
        os.makedirs('data')
    
    conn = sqlite3.connect('data/solar_calculations.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_data TEXT NOT NULL,
            result_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def register_russian_font():
    """Регистрация шрифтов для PDF"""
    try:
        pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
        return 'DejaVuSans'
    except:
        try:
            pdfmetrics.registerFont(TTFont('Arial', 'arial.ttf'))
            return 'Arial'
        except:
            return 'Helvetica'

# ===== КЛАСС КАЛЬКУЛЯТОРА =====

class AdvancedSolarCalculator:
    def __init__(self):
        self.panel_types = {
            'mono': {'efficiency': 0.22, 'degradation': 0.005, 'price_per_watt': 35},
            'poly': {'efficiency': 0.18, 'degradation': 0.007, 'price_per_watt': 28},
            'thin_film': {'efficiency': 0.15, 'degradation': 0.01, 'price_per_watt': 25}
        }
        
        self.inverter_types = {
            'string': {'efficiency': 0.97, 'lifetime': 10, 'price_per_kw': 15000},
            'micro': {'efficiency': 0.985, 'lifetime': 25, 'price_per_kw': 20000},
            'hybrid': {'efficiency': 0.96, 'lifetime': 15, 'price_per_kw': 25000}
        }
        
        self.battery_types = {
            'lead_acid': {'efficiency': 0.85, 'cycles': 500, 'price_per_kwh': 8000},
            'lifepo4': {'efficiency': 0.95, 'cycles': 3000, 'price_per_kwh': 15000},
            'li_ion': {'efficiency': 0.92, 'cycles': 2000, 'price_per_kwh': 12000}
        }

    def calculate_advanced(self, data):
        try:
            # Основные параметры
            panel_type = data.get('panel_type', 'mono')
            panel_count = int(data.get('panel_count', 10))
            panel_power = float(data.get('panel_power', 450))
            
            inverter_type = data.get('inverter_type', 'string')
            battery_type = data.get('battery_type', 'lifepo4')
            battery_capacity = float(data.get('battery_capacity', 0))
            
            region = data.get('region', 'Москва')
            roof_angle = float(data.get('roof_angle', 35))
            azimuth = float(data.get('azimuth', 0))
            
            # Экономические параметры
            electricity_price = float(data.get('electricity_price', 5.0))
            installation_cost = float(data.get('installation_cost', 50000))
            
            # Получаем характеристики оборудования
            panel_data = self.panel_types[panel_type]
            inverter_data = self.inverter_types[inverter_type]
            battery_data = self.battery_types[battery_type]
            
            # Расчеты
            total_power = panel_count * panel_power
            total_area = (panel_count * panel_power) / (1000 * panel_data['efficiency'])
            
            # Расчет выработки с учетом региона и углов
            annual_generation = self.calculate_annual_generation(
                total_power, panel_data['efficiency'], roof_angle, azimuth, region
            )
            
            # Эффективность системы
            system_efficiency = panel_data['efficiency'] * inverter_data['efficiency']
            if battery_capacity > 0:
                system_efficiency *= battery_data['efficiency']
            
            # Экономические расчеты
            equipment_cost = (total_power * panel_data['price_per_watt'] + 
                             (total_power / 1000) * inverter_data['price_per_kw'] +
                             battery_capacity * battery_data['price_per_kwh'])
            
            total_cost = equipment_cost + installation_cost
            annual_savings = annual_generation * electricity_price
            payback_years = total_cost / annual_savings if annual_savings > 0 else 0
            
            # Расчет degradation за 25 лет
            degradation_factor = (1 - panel_data['degradation']) ** 25
            total_25year_generation = annual_generation * (1 - degradation_factor) / panel_data['degradation']
            
            # ROI за 25 лет
            total_savings_25years = annual_savings * 25 * 0.8
            roi_25years = ((total_savings_25years - total_cost) / total_cost * 100) if total_cost > 0 else 0
            
            # Экологические показатели
            co2_saved = annual_generation * 0.5
            trees_equivalent = co2_saved / 21.77
            
            return {
                'technical': {
                    'total_power': total_power,
                    'total_area': round(total_area, 2),
                    'annual_generation': round(annual_generation),
                    'daily_generation': round(annual_generation / 365, 2),
                    'system_efficiency': round(system_efficiency * 100, 1),
                    'battery_backup_hours': round(battery_capacity * 1000 / (total_power * 0.7), 1) if battery_capacity > 0 else 0
                },
                'economic': {
                    'equipment_cost': round(equipment_cost),
                    'total_cost': round(total_cost),
                    'annual_savings': round(annual_savings),
                    'payback_years': round(payback_years, 1),
                    'roi_25years': round(roi_25years, 1),
                    'total_25year_generation': round(total_25year_generation)
                },
                'environmental': {
                    'co2_saved_annual': round(co2_saved),
                    'trees_equivalent': round(trees_equivalent),
                    'co2_saved_25years': round(co2_saved * 25)
                },
                'monthly_generation': self.calculate_monthly_generation(annual_generation, region),
                'input_data': data
            }
        except Exception as e:
            raise Exception(f"Ошибка расчета: {str(e)}")
    
    def calculate_annual_generation(self, total_power, efficiency, angle, azimuth, region):
        region_factors = {
            'Москва': 3.5,
            'Сочи': 4.2,
            'Краснодар': 4.0,
            'Ростов-на-Дону': 3.8,
            'Волгоград': 3.9,
            'Екатеринбург': 3.2,
            'Новосибирск': 3.0,
            'Владивосток': 3.7
        }
        
        base_factor = region_factors.get(region, 3.5)
        angle_factor = math.cos(math.radians(angle - 35))
        azimuth_factor = 1 - abs(azimuth) / 180 * 0.2
        
        annual_generation = total_power * base_factor * efficiency * angle_factor * azimuth_factor
        return max(annual_generation, 0)
    
    def calculate_monthly_generation(self, annual_generation, region):
        seasonal_factors = {
            'Москва': [0.2, 0.3, 0.8, 1.2, 1.5, 1.6, 1.5, 1.3, 0.9, 0.5, 0.2, 0.1],
            'Сочи': [0.4, 0.5, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.1, 0.8, 0.5, 0.3],
            'Краснодар': [0.3, 0.4, 0.9, 1.2, 1.4, 1.5, 1.4, 1.3, 1.0, 0.7, 0.4, 0.2],
            'Ростов-на-Дону': [0.3, 0.4, 0.8, 1.1, 1.4, 1.5, 1.4, 1.2, 0.9, 0.6, 0.3, 0.2],
            'Волгоград': [0.3, 0.4, 0.9, 1.2, 1.4, 1.5, 1.4, 1.2, 0.9, 0.6, 0.3, 0.2],
            'Екатеринбург': [0.2, 0.3, 0.7, 1.0, 1.3, 1.4, 1.3, 1.1, 0.8, 0.5, 0.2, 0.1],
            'Новосибирск': [0.2, 0.3, 0.7, 1.0, 1.2, 1.3, 1.2, 1.0, 0.7, 0.4, 0.2, 0.1],
            'Владивосток': [0.3, 0.4, 0.8, 1.1, 1.3, 1.2, 1.1, 1.2, 1.0, 0.7, 0.4, 0.3]
        }
        
        factors = seasonal_factors.get(region, [0.3, 0.4, 0.9, 1.2, 1.4, 1.5, 1.4, 1.2, 0.9, 0.6, 0.3, 0.2])
        total_factor = sum(factors)
        
        return [round(annual_generation * factor / total_factor, 2) for factor in factors]

# ===== КОНТЕКСТНЫЙ ПРОЦЕССОР =====

@app.context_processor
def inject_global_variables():
    """Добавляем глобальные переменные во все шаблоны"""
    return {
        # Базовые переменные для навигации
        'current_page': request.endpoint if request.endpoint else 'index',
        # Простая функция, если в шаблонах остались вызовы t()
        't': lambda key: key
    }

# ===== МАРШРУТЫ =====

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/advanced-calculator')
def advanced_calculator():
    return render_template('advanced_calculator.html')

@app.route('/components')
def components():
    return render_template('components.html')

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/advantages')
def advantages():
    return render_template('advantages.html')

@app.route('/comparison')
def comparison():
    return render_template('comparison.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data received'})
        
        calculator = AdvancedSolarCalculator()
        result = calculator.calculate_advanced(data)
        
        conn = sqlite3.connect('data/solar_calculations.db')
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO calculations (input_data, result_data) VALUES (?, ?)',
            (json.dumps(data, ensure_ascii=False), json.dumps(result, ensure_ascii=False))
        )
        calculation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'data': result, 
            'calculation_id': calculation_id
        })
    except Exception as e:
        print(f"Calculation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/calculations-history')
def api_calculations_history():
    try:
        conn = sqlite3.connect('data/solar_calculations.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM calculations ORDER BY created_at DESC LIMIT 10')
        calculations = cursor.fetchall()
        conn.close()
        
        result = []
        for calc in calculations:
            result.append({
                'id': calc[0],
                'input_data': json.loads(calc[1]),
                'result_data': json.loads(calc[2]),
                'created_at': calc[3]
            })
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/export-pdf/<int:calculation_id>')
def export_pdf(calculation_id):
    """Экспорт расчета в PDF"""
    try:
        calculator = AdvancedSolarCalculator()
        
        conn = sqlite3.connect('data/solar_calculations.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM calculations WHERE id = ?', (calculation_id,))
        calculation = cursor.fetchone()
        conn.close()
        
        if not calculation:
            return "Расчет не найден", 404
        
        input_data = json.loads(calculation[1])
        result_data = json.loads(calculation[2])
        created_at = calculation[3]
        
        # Заголовки
        title = 'SolarCalc Pro - Отчет по расчету солнечной электростанции'
        sections = {
            'parameters': '1. Входные параметры системы',
            'technical': '2. Технические показатели',
            'economic': '3. Экономические показатели',
            'environmental': '4. Экологические показатели',
            'conclusion': '5. Заключение'
        }
        labels = {
            'parameter': 'Параметр',
            'value': 'Значение',
            'date': 'Дата расчета',
            'total_power': 'Общая мощность',
            'annual_generation': 'Годовая выработка',
            'daily_generation': 'Суточная выработка',
            'system_efficiency': 'КПД системы',
            'area': 'Площадь панелей',
            'autonomy': 'Автономность',
            'equipment_cost': 'Стоимость оборудования',
            'total_cost': 'Общая стоимость',
            'annual_savings': 'Годовая экономия',
            'payback': 'Срок окупаемости',
            'roi': 'ROI за 25 лет',
            'generation_25y': 'Выработка за 25 лет',
            'co2_saved': 'CO₂ сэкономлено в год',
            'trees': 'Эквивалент деревьев',
            'co2_25y': 'CO₂ сэкономлено за 25 лет'
        }
        
        # Имена типов оборудования
        panel_names = {
            'mono': 'Монокристаллические',
            'poly': 'Поликристаллические',
            'thin_film': 'Тонкопленочные'
        }
        
        inverter_names = {
            'string': 'Стринговый',
            'micro': 'Микроинверторы',
            'hybrid': 'Гибридный'
        }
        
        battery_names = {
            'lead_acid': 'Свинцово-кислотные',
            'lifepo4': 'LiFePO4',
            'li_ion': 'Li-Ion'
        }
        
        panel_name = panel_names.get(input_data.get('panel_type', 'mono'), '')
        inverter_name = inverter_names.get(input_data.get('inverter_type', 'string'), '')
        battery_name = battery_names.get(input_data.get('battery_type', 'lifepo4'), '')
        
        # Создаем PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
            encoding='utf-8'
        )
        
        story = []
        font_name = register_russian_font()
        styles = getSampleStyleSheet()
        
        # Стили
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName=font_name,
            fontSize=16,
            spaceAfter=30,
            textColor=colors.HexColor('#2563eb')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontName=font_name,
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#1f2937')
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=10,
            spaceAfter=12
        )
        
        # Заголовок
        story.append(Paragraph(title, title_style))
        story.append(Paragraph(f"{labels['date']}: {created_at}", normal_style))
        story.append(Spacer(1, 20))
        
        # Входные параметры
        story.append(Paragraph(sections['parameters'], heading_style))
        
        input_table_data = [
            [labels['parameter'], labels['value']],
            ['Тип панелей', panel_name],
            ['Мощность панели', f"{input_data.get('panel_power', 450)} Вт"],
            ['Количество панелей', str(input_data.get('panel_count', 10))],
            [labels['total_power'], f"{result_data['technical']['total_power']} Вт"],
            ['Регион', input_data.get('region', 'Москва')],
            ['Угол наклона', f"{input_data.get('roof_angle', 35)}°"],
            ['Азимут', f"{input_data.get('azimuth', 0)}°"]
        ]
        
        input_table = Table(input_table_data, colWidths=[3*inch, 3*inch])
        input_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_name),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))
        story.append(input_table)
        story.append(Spacer(1, 20))
        
        # Технические показатели
        story.append(Paragraph(sections['technical'], heading_style))
        tech_data = result_data['technical']
        tech_table_data = [
            [labels['parameter'], labels['value']],
            [labels['total_power'], f"{tech_data['total_power']} Вт"],
            [labels['annual_generation'], f"{tech_data['annual_generation']:,.0f} кВт·ч"],
            [labels['daily_generation'], f"{tech_data['daily_generation']} кВт·ч"],
            [labels['system_efficiency'], f"{tech_data['system_efficiency']}%"],
            [labels['area'], f"{tech_data['total_area']} м²"],
        ]
        
        tech_table = Table(tech_table_data, colWidths=[3*inch, 3*inch])
        tech_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_name),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dcfce7'))
        ]))
        story.append(tech_table)
        story.append(Spacer(1, 20))
        
        # Экономические показатели
        story.append(Paragraph(sections['economic'], heading_style))
        econ_data = result_data['economic']
        
        econ_table_data = [
            [labels['parameter'], labels['value']],
            [labels['equipment_cost'], f"{econ_data['equipment_cost']:,.0f} руб"],
            [labels['total_cost'], f"{econ_data['total_cost']:,.0f} руб"],
            [labels['annual_savings'], f"{econ_data['annual_savings']:,.0f} руб"],
            [labels['payback'], f"{econ_data['payback_years']} лет"],
            [labels['roi'], f"{econ_data['roi_25years']}%"],
            [labels['generation_25y'], f"{econ_data['total_25year_generation']:,.0f} кВт·ч"]
        ]
        
        econ_table = Table(econ_table_data, colWidths=[3*inch, 3*inch])
        econ_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_name),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fffbeb')),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#fed7aa'))
        ]))
        story.append(econ_table)
        story.append(Spacer(1, 20))
        
        # Экологические показатели
        story.append(Paragraph(sections['environmental'], heading_style))
        env_data = result_data['environmental']
        
        env_table_data = [
            [labels['parameter'], labels['value']],
            [labels['co2_saved'], f"{env_data['co2_saved_annual']:,.0f} кг"],
            [labels['trees'], f"{env_data['trees_equivalent']:,.0f}"],
            [labels['co2_25y'], f"{env_data['co2_saved_25years']/1000:,.1f} тонн"]
        ]
        
        env_table = Table(env_table_data, colWidths=[3*inch, 3*inch])
        env_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_name),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecfdf5')),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a7f3d0'))
        ]))
        story.append(env_table)
        story.append(Spacer(1, 20))
        
        # Заключение
        story.append(Paragraph(sections['conclusion'], heading_style))
        
        conclusion = f"""
        Солнечная электростанция мощностью {result_data['technical']['total_power']} Вт 
        обеспечит годовую выработку {result_data['technical']['annual_generation']:,.0f} кВт·ч 
        и окупится за {result_data['economic']['payback_years']} лет. 
        За 25 лет эксплуатации система сэкономит {result_data['environmental']['co2_saved_25years']/1000:,.1f} тонн CO₂.
        """
        
        story.append(Paragraph(conclusion, normal_style))
        
        # Строим PDF
        doc.build(story)
        buffer.seek(0)
        
        filename = f'solar_calculation_{calculation_id}.pdf'
        return send_file(
            buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"PDF export error: {str(e)}")
        return f"Ошибка при создании PDF: {str(e)}", 500

# ===== ЗАПУСК ПРИЛОЖЕНИЯ =====

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)