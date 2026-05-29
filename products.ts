/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  category: 'energy' | 'cold' | 'fruit' | 'natural' | 'volt';
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  priceIqd: number; // e.g. 2500
  image: string;
}

export const productsData: Product[] = [
  // Energy Drinks (مشروبات طاقة)
  {
    id: 'e1',
    category: 'energy',
    nameAr: 'فولت الكلاسيكي الأصلي ⚡',
    nameEn: 'Volt Classic Original ⚡',
    descAr: 'الخلطة المتكاملة من طاقة فولت الجبارة نكهة كلاسيكية تفجر النشاط والتركيز الذهني طوال يومك العصيب.',
    descEn: 'The absolute state of Volt energy. Classic flavor crafted to trigger high-intensity physical performance & deep brain focus.',
    priceIqd: 2500,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e2',
    category: 'energy',
    nameAr: 'فولت الإعصار الأحمر 🔥',
    nameEn: 'Volt Red Fury 🔥',
    descAr: 'بركان متفجر من التوت البري الحار والرمان معزز بالكافيين الطبيعي ليمنحك عزماً وروحاً لا تقهر.',
    descEn: 'A blazing volcano of wild cranberries and sour pomegranate, supercharged with natural caffeine to keep you unstoppable.',
    priceIqd: 3000,
    image: 'https://images.unsplash.com/photo-1527960471264-93a8172db630?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e3',
    category: 'energy',
    nameAr: 'فولت آيس الأزرق المجمّد ❄️',
    nameEn: 'Volt Blue Ice Freeze ❄️',
    descAr: 'انتعاش الجليد المطلق بلمسة التوت الأزرق المنعشة التي تجري في عروقك لترطيب خلاياك بشكل فائق.',
    descEn: 'Absolute sub-zero absolute cold! Infused with fresh mountain blackberries & cool menthol hints for elite hydration.',
    priceIqd: 3250,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e4',
    category: 'energy',
    nameAr: 'فولت ألترا زيرو دايت 🛡️',
    nameEn: 'Volt Ultra Zero Sugar 🛡️',
    descAr: 'خفيف وصحي وخالي تماماً من السكر، طاقة فورية نقية معززة بالفيتامينات الأساسية لمتبعي الكيتو والدايت.',
    descEn: 'Light, crisp, and 100% sugar-free. Clean instant burst fueled with essential B-Vitamins optimal for workouts and diets.',
    priceIqd: 2750,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600'
  },

  // Cold Drinks (مشروبات باردة)
  {
    id: 'c1',
    category: 'cold',
    nameAr: 'قهوة فولت المثلجة ☕',
    nameEn: 'Volt Iced Latte ☕',
    descAr: 'إسبريسو غني مضاعف مع الحليب البارد ورغوة الكريمة السحرية المذابة بلطف.',
    descEn: 'Double premium reserve espresso poured over icy fresh whole milk and a subtle touch of sweetness.',
    priceIqd: 4000,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'c2',
    category: 'cold',
    nameAr: 'موهيتو ليمون ونعناع منعش 🍃',
    nameEn: 'Mint Lemon Mojito 🍃',
    descAr: 'صفاء الطبيعة المنعش مع أوراق النعناع البلدي المهروس والليمون الأخضر الغني بالفيتامين.',
    descEn: 'Sparkling mineral base muddled with organic mint leaves, pure lime squeeze, and crushed glaciers.',
    priceIqd: 3500,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600'
  },

  // Fruit Juices (مشروبات فواكه)
  {
    id: 'f1',
    category: 'fruit',
    nameAr: 'عصير برتقال فولت الطازج 🍊',
    nameEn: 'Volt Fresh Orange 🍊',
    descAr: 'مستخلص من أفضل حبات البرتقال العراقي الطبيعي 100٪ بدون إضافة ماء أو سكر صناعي.',
    descEn: '100% newly squeezed sun-ripened Iraqi oranges, fully packed with natural Vitamin C and zero added sugars.',
    priceIqd: 3000,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'f2',
    category: 'fruit',
    nameAr: 'كوكتيل استوائي خارق 🍍',
    nameEn: 'Super Tropical Cocktail 🍍',
    descAr: 'سيمفونية استوائية لذيذة تجمع بين الأناناس والمانجو اللذيذ ولمسة خفيفة من ثمرة جوز الهند.',
    descEn: 'A magical island taste combining juicy golden pineapples, elite mango cream, and soft coconut splashes.',
    priceIqd: 4500,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600'
  },

  // Natural Drinks (مشروبات طبيعية)
  {
    id: 'n1',
    category: 'natural',
    nameAr: 'شاي الزنجبيل والليمون العضوي 🌱',
    nameEn: 'Organic Ginger Lemon 🌱',
    descAr: 'مزيج صحي دافئ لرفع المناعة وتطهير الجسم بالزنجبيل الحار والعسل الجبلي الصافي.',
    descEn: 'Wellness shot in a mug: spicy hand-milled ginger root blended with mountain honey and hot lime.',
    priceIqd: 2500,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'
  },

  // Volt Special Mix (خلطة VOLT)
  {
    id: 'v1',
    category: 'volt',
    nameAr: 'خلطة فولت السرية الرهيبة 🔥🍹',
    nameEn: 'VOLT Mystic Secret Mix 🔥🍹',
    descAr: 'الخلطة الخاصة جداً التي صنعت من أجل رواد المغامرة والتميز: نكهات سحرية سرية تعيد برمجة حواسك بالكامل!',
    descEn: 'Our ultimate flagship brew! Hand-blended mystery spices and exotic juices delivering extraordinary mood-uplifting states.',
    priceIqd: 5000,
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=600'
  }
];
