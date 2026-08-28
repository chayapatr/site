export type WritingSource = 'medium' | 'spaceth' | 'substack';

export type Writing = {
  title: string;
  source: WritingSource;
  date: string;
  slug: string;
  claps?: number;
  responses?: number;
};

export type WritingYear = { year: number; writings: Writing[] };

export const writings: WritingYear[] = [
  {
    year: 2025,
    writings: [
      {
        title: '4 ปี ระหว่างลาออกจากจุฬา ถึงเรียนต่อ MIT',
        source: 'medium',
        date: '2025',
        slug: '4-years-chula-to-mit',
        claps: 1,
      },
      {
        title: 'เมษายน: เมกา-สิงคโปร์-ญี่ปุ่น',
        source: 'medium',
        date: '2025-04',
        slug: 'april-mega-singapore-japan',
        claps: 20,
      },
    ],
  },
  {
    year: 2024,
    writings: [
      {
        title: 'map of music & other humanly organized sound 🎵',
        source: 'medium',
        date: '2024',
        slug: 'map-of-music',
      },
      {
        title: 'Mad Unicorn',
        source: 'medium',
        date: '2024',
        slug: 'mad-unicorn',
        claps: 298,
        responses: 4,
      },
      {
        title: 'a problem with squares',
        source: 'medium',
        date: '2024',
        slug: 'problem-with-squares',
        claps: 36,
        responses: 1,
      },
    ],
  },
  {
    year: 2023,
    writings: [
      {
        title: 'Typeface ไทยในโลกปัจจุบัน?',
        source: 'medium',
        date: '2023',
        slug: 'thai-typeface',
        claps: 25,
      },
      {
        title: 'The Goodwill Messages: ปริศนาจดหมายจากไทยบนพื้นผิวดวงจันทร์',
        source: 'spaceth',
        date: '2023-10-07',
        slug: 'goodwill-messages',
      },
      {
        title: 'บันทึกเมษาหน้าโง่: ประภากรเอกทศฤกษ์ ราชบัณฑิตสถาน กับความกระตุกจิตกระชากใจ',
        source: 'spaceth',
        date: '2023-04-04',
        slug: 'april-fools-journal',
      },
      {
        title: 'บันทึก Bangkok Open Source Hackathon',
        source: 'medium',
        date: '2023',
        slug: 'bangkok-open-source-hackathon',
        claps: 2,
      },
    ],
  },
  {
    year: 2022,
    writings: [
      {
        title: 'เราแยกศิลปินออกจากงานศิลปะได้มั้ย? — บันทึกความคิดเห็นส่วนตัว',
        source: 'medium',
        date: '2022',
        slug: 'separate-artist-from-art',
      },
      {
        title: 'Group Theory: สมมาตรกับสัตว์ประหลาด 196,883 มิติ',
        source: 'medium',
        date: '2022',
        slug: 'group-theory',
        claps: 39,
      },
      {
        title: 'ความยึดโยงของดวงดาวต่อชาวอียิปต์โบราณ',
        source: 'spaceth',
        date: '2022-04-17',
        slug: 'stars-ancient-egypt',
      },
      {
        title: 'ลำดับเหตุการณ์ความขัดแย้งด้านอวกาศ ที่ใหญ่ที่สุดนับจากยุคสงครามเย็น',
        source: 'spaceth',
        date: '2022-03-04',
        slug: 'space-conflict-timeline',
      },
      {
        title: 'ความสัมพันธ์ทางอวกาศภายใต้วิกฤตการณ์ยูเครน',
        source: 'spaceth',
        date: '2022-02-25',
        slug: 'space-ukraine-crisis',
      },
      {
        title: 'MIT ชวนเราส่งเสียงไปยังสถานีอวกาศนานาชาติ เพื่อบอกว่าอวกาศเป็นของทุกคน',
        source: 'spaceth',
        date: '2022-01-23',
        slug: 'mit-iss-sound',
      },
    ],
  },
  {
    year: 2021,
    writings: [
      {
        title: 'รีวิวการใช้ GPT-3 เขียนการบ้านให้',
        source: 'medium',
        date: '2021',
        slug: 'gpt3-homework-review',
        claps: 13,
      },
      {
        title: '(ไม่) Forgotten: ในความทรงจำของเด็กมัธยมผู้สร้างละครเวที',
        source: 'medium',
        date: '2021-05-30',
        slug: 'not-forgotten-theater',
        claps: 7,
      },
      {
        title: 'เล่าเรื่อง Dune: มหากาพย์ไซไฟสู่ตำนานแห่งวงการภาพยนตร์',
        source: 'spaceth',
        date: '2021-10-20',
        slug: 'dune',
      },
      {
        title: 'The Planets: ดนตรี ปกรณัม ดวงดาว โฮลส์',
        source: 'spaceth',
        date: '2021-07-17',
        slug: 'the-planets-holst',
      },
      {
        title: 'Open Source ปัจจัยสำคัญที่สร้างเฮลิคอปเตอร์ Ingenuity',
        source: 'spaceth',
        date: '2021-06-03',
        slug: 'ingenuity-open-source',
      },
      {
        title: 'SpaceCHI 2021: มนุษย์ + คอมพิวเตอร์ + อวกาศ -> อนาคต?',
        source: 'spaceth',
        date: '2021-05-23',
        slug: 'spacechi-2021',
      },
      {
        title: 'Space Economy Lifting Off 2021: เปิดโฉมหน้าบริษัทอวกาศในไทย',
        source: 'spaceth',
        date: '2021-04-17',
        slug: 'space-economy-2021-companies',
      },
      {
        title: 'Space Economy Lifting Off 2021: เข้าใจใหม่ ธุรกิจอวกาศไม่ได้มีแค่ดาวเทียม',
        source: 'spaceth',
        date: '2021-04-03',
        slug: 'space-economy-2021-intro',
      },
      {
        title: 'นิทรรศการศิลปะ คลื่นสมอง โมเดลสามมิติ แบคทีเรีย หินดวงจันทร์และเจ้าหญิงคางุยะ',
        source: 'spaceth',
        date: '2021-03-14',
        slug: 'art-exhibition-moon-rock',
      },
      {
        title: 'การลาออกของจิม บริเดนสไตน์ ผู้อำนวยการ NASA',
        source: 'spaceth',
        date: '2021-01-21',
        slug: 'bridenstine-nasa-resignation',
      },
    ],
  },
  {
    year: 2020,
    writings: [
      {
        title: 'พาชม SOLAR LAND ล่า ท้า แสง นิทรรศการล่าสุดที่ TCDC',
        source: 'spaceth',
        date: '2020-10-09',
        slug: 'solar-land-tcdc',
      },
      {
        title: 'DNA Storage อนาคตของการเก็บข้อมูล',
        source: 'spaceth',
        date: '2020-09-24',
        slug: 'dna-storage',
      },
      {
        title: 'Apple เปิดตัว Teaser แรก For All Mankind ซีซั่น 2',
        source: 'spaceth',
        date: '2020-08-01',
        slug: 'for-all-mankind-s2-teaser',
      },
      {
        title: 'C/2020 F3 NEOWISE ดาวหางที่เห็นได้ด้วยตาในช่วงนี้',
        source: 'spaceth',
        date: '2020-07-09',
        slug: 'neowise-comet',
      },
      {
        title: 'Mars 2020 กับ COVID-19: NASA สร้างป้ายติดไว้กับ Perseverance',
        source: 'spaceth',
        date: '2020-06-23',
        slug: 'mars-2020-covid-plaque',
      },
      {
        title: 'ทำไมการเมืองถึงพามนุษย์ไปดวงจันทร์: We came in peace for all mankind?',
        source: 'spaceth',
        date: '2020-06-08',
        slug: 'politics-moon-landing',
      },
      {
        title: 'Crew Demo-2 ทะยานขึ้นสู่ท้องฟ้าได้สำเร็จ',
        source: 'spaceth',
        date: '2020-05-31',
        slug: 'crew-demo-2-launch',
      },
      {
        title: 'Crew Demo-2 เลื่อนการปล่อยในนาทีที่ 16 ก่อนปล่อย',
        source: 'spaceth',
        date: '2020-05-28',
        slug: 'crew-demo-2-scrub',
      },
      {
        title: 'วิเคราะห์ Tom Cruise จะไปถ่ายหนังบนอวกาศ?',
        source: 'spaceth',
        date: '2020-05-06',
        slug: 'tom-cruise-space-film',
      },
      {
        title: 'NASA, ESA และ JAXA ประกาศร่วมมือกันจัด Virtual Hackathon',
        source: 'spaceth',
        date: '2020-05-02',
        slug: 'nasa-esa-jaxa-hackathon',
      },
      {
        title: 'ฮาวทูทิ้ง วิธีทิ้งขยะแบบนักบินอวกาศ',
        source: 'spaceth',
        date: '2020-05-01',
        slug: 'astronaut-waste-management',
      },
      {
        title: 'FutureTalks: เราเมาอวกาศได้ไหม เหมืองบนดาวอังคาร วัสดุกันรังสีอวกาศ',
        source: 'spaceth',
        date: '2020-04-17',
        slug: 'futuretalks-space-mining',
      },
      {
        title: 'การป่วยในอวกาศ ประวัติศาสตร์ และวิธีรับมือ',
        source: 'spaceth',
        date: '2020-03-30',
        slug: 'space-sickness',
      },
      {
        title: 'เราได้อะไรจากการส่งปลาไปว่ายน้ำในอวกาศ',
        source: 'spaceth',
        date: '2020-03-22',
        slug: 'fish-in-space',
      },
      {
        title: 'FutureTalks: ในอวกาศมนุษย์จะกลายพันธุ์ไหม หายใจอย่างไร ปลูกพืชได้ไหม',
        source: 'spaceth',
        date: '2020-03-19',
        slug: 'futuretalks-space-biology',
      },
      {
        title: 'อนาคตของการปลูกพืชในอวกาศ ความมั่นคงด้านอาหารแห่งอนาคต',
        source: 'spaceth',
        date: '2020-03-14',
        slug: 'space-farming',
      },
      {
        title: 'สุขภาพจิต ประเด็นสำคัญที่ไม่ควรมองข้ามในการสำรวจอวกาศ',
        source: 'spaceth',
        date: '2020-03-11',
        slug: 'mental-health-space',
      },
      {
        title: 'เมื่อเยาวชนก็ทำโครงการอวกาศของตัวเอง',
        source: 'spaceth',
        date: '2020-02-18',
        slug: 'youth-space-projects',
      },
      {
        title: 'ประวัติศาสตร์ของไอศกรีมบนอวกาศ และของฝากที่ไม่ใช่ของจริง',
        source: 'spaceth',
        date: '2020-02-02',
        slug: 'space-ice-cream-history',
      },
    ],
  },
  {
    year: 2019,
    writings: [
      {
        title: 'Cat T-Shirt 6, คอมพิวเตอร์โอลิมปิกระดับชาติ (TOI15), การจัดบ้านแบบคอนมาริกับเรื่องอื่น ๆ…',
        source: 'medium',
        date: '2019-11-10',
        slug: 'cat-t-shirt-6-toi15',
        claps: 65,
      },
      {
        title: 'มหากาพย์รีวิวสอวน. คอมพิวเตอร์ปี 2561 ค่าย 1 และค่าย 2 (กรุงเทพฯ)',
        source: 'medium',
        date: '2019-03-22',
        slug: 'sow-computer-camp-2018',
        claps: 322,
        responses: 1,
      },
      {
        title: 'เบื้องหลังการออกแบบตราและแบรนดิ้ง NASA งานอาร์ตขวัญใจ Modernist',
        source: 'spaceth',
        date: '2019-12-13',
        slug: 'nasa-branding-design',
      },
      {
        title: 'Apollo Guidance Computer ในวันที่โลกยังไม่รู้จักคอมพิวเตอร์',
        source: 'spaceth',
        date: '2019-07-23',
        slug: 'apollo-guidance-computer',
      },
    ],
  },
];
