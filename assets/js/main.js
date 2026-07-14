const WHATSAPP_NUMBER = '51972507949';

const FALLBACK_PRODUCTS = [
  {
    id: 1, title: "Prostate", cat: "Fertilidad",
    short: "Defensas al máximo.",
    full: "• Aumenta el libido y la función sexual masculina.<br>• Mejora la fertilidad masculina.<br>• Aumenta la energia y el rendimiento físico.<br>• Reduce el riesgo de cáncer de próstata.",
    ing: "Maca, Ginseng panax, Huarnarpo macho saw palmetto, Achiote, Mashua,Vit C, Zinc",
    use: "2 cápsulas diarias",
    media: [{ type: "img", src: "fotos/Prostate1.webp" }, { type: "img", src: "fotos/Prostate2.webp" }]
  },
  {
    id: 2, title: "Colágeno Premiun", cat: "Articulaciones",
    short: "Movilidad sin dolor.",
    full: "• Reduce la inflamación de articulaciones.<br>• Previene el desgaste articular.<br>• Ayuda a tratar osteoporosis y artritis.<br>• Fortalece huesos, uñas y cabello.",
    ing: "Colágeno Hidrolizado con vitamina C, Hojas de estevia, Magnesio y Sulfato de Zinc ",
    use: "Mezclar 10 gramos de colágeno en aproximadamente 200 mililitros de agua fría y consumir de inmediato 1 vez al día ",
    media: [{ type: "img", src: "fotos/Colageno1.webp" }, { type: "img", src: "fotos/Colageno2jpeg.webp" }]
  },
  {
    id: 3, title: "Omega 3,6,9", cat: "Cardiovascular",
    short: "Corazón sano.",
    full: "• Contribuye a la salud del corazon y sistema cardiovascular.<br>• Apoya el buen funcioamiento del cerebro y la memoria.<br>• Reduce la inflamación y ayuda a aliviar dolores articulares.<br>• Mejora el perfil lipídico: ayuda a reducir triglicéridos y colesterol malo (LDL)",
    ing: "Aceite Sancha Inchi",
    use: "2 cápsulas diarias",
    media: [{ type: "img", src: "fotos/Omega1.webp" }, { type: "img", src: "fotos/Omega2.webp" }, { type: "img", src: "fotos/Omega3.webp" }]
  },
  {
    id: 4, title: "Creatina", cat: "Energía y Rendimiento",
    short: "Adiós estrés.",
    full: "• Aumenta la masa muscular magra.<br>• Mejora la fuerza y potencia física.<br>• Favorece la recuperación post-entrenamiento.<br>• Ayuda a reducir la fatiga durante el ejercicio",
    ing: "Monohidrato 100%",
    use: "Disolver el contenido de 1 cucharada dosificadora colmada (5g) de producto en agua o bebida favorita (200 ml o 7 onzas) y beber de inmediato",
    media: [{ type: "img", src: "fotos/Creatina1.webp" }, { type: "img", src: "fotos/Creatina2.webp" }, { type: "img", src: "fotos/Creatina3.webp" }]
  },
  {
    id: 5, title: "Detox Fit", cat: "Digestión",
    short: "Sol en gotas.",
    full: "• Limpieza profunda del organismo.<br>• Mejora del tránsito intestinal.<br>• Aumento de la energía.<br>• Reducción del colesterol.",
    ing: "Garcinia gambogia , Tamarindo, Penca de tuna, Aloe vera, Café verde, Higo, Almidon de maíz hidrolizado y Magnesio",
    use: "Disolver el contenido de 1 cuchara dosificadora colmada (aprox 10 g) de producto en agua o bebida favorita (200ml) y beber de inmediato.",
    media: [{ type: "img", src: "fotos/Detox Fit1.webp" }, { type: "img", src: "fotos/Detox Fit2.webp" }]
  },
  {
    id: 6, title: "BioEnergy", cat: "Energía",
    short: "Flora feliz.",
    full: "• Fortalecimiento del sistema inmunitario.<br>• Aporta vitaminas y minerales esenciales.<br>• Mejora de la circulación sanguínea.<br>• Mejora la recuperación muscular",
    ing: "Maca, Acai berry, guaraná algarrobo, Arandano, Camu Camu, Vitaminas A, E, C, B1, B2, B6, B12",
    use: "Mezclar el contenido de un stick del producto en 200 ml de agua fria y beber inmediato",
    media: [{ type: "img", src: "fotos/BioEnergy1.webp" }, { type: "img", src: "fotos/BioEnergy2.webp" }]
  },
  {
    id: 7, title: "GanoGreen", cat: "Detox",
    short: "Energía.",
    full: "• Cuidado de la piel, huesos y articulaciones.<br>• Soporte metabolico y mental con vitaminas del complejoB.<br>• Reducción de colesterol.<br>• Ayuda a combatir el cancer.",
    ing: "Ganoderma, Café, Espirulina Moringa, Calostro bovino, Aceite de almendras, Aceite de coco Aceite de sacha inchi, Stevia, Vitaminas A, D3, C, B1, B2 Y B6",
    use: "Mezclar el contenido de un sticks del producto en 200 ml aproximadamente de agua tibia o caliente y beber de inmediato.",
    media: [{ type: "img", src: "fotos/GanoGreen1.webp" }, { type: "img", src: "fotos/GanoGreen2.webp" }]
  },
  {
    id: 8, title: "FloraInts", cat: "Digestión",
    short: "Fuerza natural.",
    full: "• Reducción de la inflamación gastrica.<br>• Mejora de la absorcioón de nurtrientes.<br>• Alivio del estriñimiento.<br>• Protección de la muscosa gástrica.",
    ing: "Aloe vera, Arroz, Yacón, 7 Cepas Cultivos Probioticos, Aguaymanto, Vitaminas A, C, D, B1, B2, B6, Magnesio, Zinc, Fosforo, Potasio.",
    use: "Mezclar el contenido de un sticks del producto en 200 ml aproximadamente de agua tibia o caliente y beber de inmediato.",
    media: [{ type: "img", src: "fotos/Floraints1.webp" }]
  },
  {
    id: 9, title: "CalcioZen", cat: "Huesos",
    short: "Fortalece tu cuerpo, cuida tus huesos.",
    full: "• Huesos y dientes fuertes: El calcio, fósforo, magnesio y vitaminas trabajan juntos para mantenerlos resistentes.<br>• Mejor absorción del calcio gracias a la acción de la Vitamina D3.<br>• Función muscular adecuada: Previene calambres y fortalece los músculos.<br>• Menos cansancio y fatiga gracias al poderoso Complejo B.<br>• Sistema inmunológico fortalecido por la vitamina C, zinc y antioxidantes.<br>• Apoya la salud cardiovascular, nerviosa y la formación de glóbulos rojos.",
    ing: "Moringa, Guanábana, Acelga, Espinaca, Camu Camu, Acerola, Calcio, Magnesio, Fósforo, Zinc, Vitamina D3, Vitamina C, Vitamina K y Vitaminas B1, B2, B3, B5, B6, B9, B12.",
    use: "Mezclar el contenido de un sachet (10g) en aproximadamente 200 ml de agua tibia o fría y beber de inmediato.",
    media: [{ type: "img", src: "fotos/CalcioZen1.webp" }]
  },
  {
    id: 10, title: "HepZen", cat: "Detox",
    short: "Fórmula natural para el cuidado del hígado.",
    full: "• Protege las células hepáticas y favorece su regeneración gracias al Cardo Mariano (Silimarina).<br>• Favorece la producción de bilis y ayuda a una rápida digestión de las grasas.<br>• Apoya la función de desintoxicación natural del hígado.<br>• Contribuye al control de colesterol y triglicéridos.<br>• Potente acción antioxidante celular contra el estrés oxidativo.<br>• Excelente apoyo complementario en casos de hígado graso.",
    ing: "Alcachofa, Cardo Mariano, Limón, Toronja, Aceite de Oliva, Tuna Roja (fruto del nopal), Pera, Hierba Luisa, Vitaminas A, B1, B2, B6, B12, C y Zinc.",
    use: "Mezclar el contenido de un sachet (10g) en aproximadamente 200 ml de agua y beber de inmediato.",
    media: [{ type: "img", src: "fotos/HepZen1.webp" }]
  },
  {
    id: 11, title: "GanoGold", cat: "Energía y Defensas",
    short: "Potente fórmula natural para fortalecer las defensas y aportar vitalidad.",
    full: "• Refuerza potentemente el sistema inmunológico y eleva las defensas gracias al Ganoderma y el Colostro Bovino.<br>• Proporciona una fuente de energía natural e inmediata, combatiendo el cansancio y la fatiga crónica.<br>• Aporta una potente acción antioxidante que protege las células del estrés oxidativo.<br>• Favorece la salud cardiovascular y la función cerebral por su alto contenido de Omega 3, 6 y 9.<br>• Contribuye al equilibrio hormonal y mejora notablemente el rendimiento físico y mental.<br>• Apoya la salud intestinal y promueve una óptima recuperación física y muscular.",
    ing: "Ganoderma (Reishi), Moringa, Sacha Inchi, Aceite de Coco, Maca, Colostro Bovino, Cacao, Stevia, Vitaminas (A, C, D3, B1, B2, B6).",
    use: "Mezclar una cucharada (10g) en un vaso de agua, jugo o batido y tomar de inmediato, de preferencia por las mañanas.",
    media: [{ type: "img", src: "fotos/GanoGold1.webp" }, { type: "img", src: "fotos/GanoGold2.webp" }, { type: "img", src: "fotos/GanoGold3.webp" }]
  },
];


function initNavbar() {
  const navbar = document.querySelector('.navbar-biozen');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

const supabaseUrl = 'https://sziwmmxtwqacevyyngkr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aXdtbXh0d3FhY2V2eXluZ2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTA2MjQsImV4cCI6MjA5ODA2NjYyNH0.G-9gRhDo7FHX3TpEfMOIQH9CGCUMVdMHCYgL3CvTU2w';

let products = [];

async function cargarProductos() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('products')
    .select('id, title, cat, short, full, ing, use, product_images ( src )')
    .order('id', { ascending: true });

  if (error) {
    console.warn('Supabase error:', error);
    return null;
  }

  const mapped = data.map(item => ({
    id: item.id,
    title: item.title,
    cat: item.cat || '',
    short: item.short,
    full: item.full,
    ing: item.ing,
    use: item.use,
    media: item.product_images && item.product_images.length > 0
      ? item.product_images.map(img => ({ type: 'img', src: img.src }))
      : [{ type: 'img', src: 'fotos/Prostate1.webp' }]
  }));
  return mapped;
}

document.addEventListener('DOMContentLoaded', function () {
  initSmoothScroll();
  initNavbar();
  initBackToTop();

  products = FALLBACK_PRODUCTS;
  window.products = products;
  if (typeof renderProductsGrid === 'function') renderProductsGrid(products);
  if (typeof renderScrollCatalog === 'function') renderScrollCatalog();

  cargarProductos().then(function (result) {
    if (result && result.length) {
      products = result;
      window.products = result;
      if (typeof renderProductsGrid === 'function') renderProductsGrid(result);
      if (typeof renderScrollCatalog === 'function') renderScrollCatalog(result);
    }
  });
});
