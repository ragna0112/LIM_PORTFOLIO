export interface Screenshot {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}
export interface ProjectConfig {
  id: string;
  number: string;
  name: string;
  type: string;
  category: string;
  headline: string;
  description: string;
  shortDescription: string;
  technicalDescription: string | null;
  keyFeatures: string[];
  tags: string[];
  screenshots: Screenshot[];
  detailScreenshot?: Screenshot;
  websiteUrl: string;
  websiteLabel: 'Live Demo' | 'Visit Website';
  repositoryUrl: string | null;
  credit: string | null;
  contribution: string | null;
  mood: 'cinema' | 'weather' | 'seismic' | 'documents';
  visualMark?: string;
}
export const profile = {
  name: 'Rich Daniel Lim',
  displayName: ['RICH DANIEL', 'LIM'],
  initials: ['R', 'L'],
  monogram: 'rl',
  course: 'Computer Science',
  title: 'Computer Science Student',
  specialization: 'Software Engineering',
  shortLabel: 'Computer Science · Software Engineering',
  heroDescription: 'I build practical web applications and turn real-world data into useful digital experiences.',
  aboutDescription: 'I’m a Computer Science student specializing in Software Engineering, focused on building practical and user-friendly applications. I enjoy turning ideas and real-world information into reliable software through web development, API integration, databases, and thoughtful interface design.',
  aboutShortDescription: 'Seeking Software Engineering internship opportunities to learn, contribute, and build useful software with a team.',
  location: 'Based in the Philippines',
  githubUrl: 'https://github.com/ragna0112',
  linkedinUrl: 'https://www.linkedin.com/in/rich-daniel-lim-28a80134a/',
  selectedWorkIntroduction: 'Four projects. Different real-world needs.\nInterfaces, APIs, databases, and workflows brought together.',
  technologyTicker: ['Python', 'React', 'TypeScript', 'PostgreSQL', 'Flask', 'Git'],
  capabilities: [
    {number:'01', title:'Interface development', description:'Responsive, user-focused web interfaces built with React, Next.js, TypeScript, HTML, and CSS. I focus on understandable states, keyboard access, and layouts that work across devices.', tools:'React / Next.js / TypeScript / HTML / CSS'},
    {number:'02', title:'APIs & SQL fundamentals', description:'Connecting applications to external APIs and working with relational databases. My projects put Python, API integration, SQL, and database modeling into practice.', tools:'Python / FastAPI / Flask / PostgreSQL / MySQL'},
    {number:'03', title:'Data-backed applications', description:'Using real-world information to build useful applications: movie analytics, weather forecasts, earthquake maps, and document request workflows.', tools:'API integration / Charts / Maps / Workflow automation'},
    {number:'04', title:'Testing & collaboration', description:'Version control, automated checks, and iterative development. My portfolio includes individual applications and a collaborative Software Engineering thesis project.', tools:'Git / GitHub / GitHub Actions / Vitest / pytest'},
  ],
};
export const projects: ProjectConfig[] = [
  {
    id:'cinemetrics', number:'01', name:'CineMetrics', type:'Movie Analytics Web Application', category:'MOVIE ANALYTICS / WEB APPLICATION',
    headline:'Behind every film,\na story in the data.',
    description:'CineMetrics is a movie analytics platform that tracks and presents changing movie trends using data collected from TMDB. It transforms regularly updated movie information into a responsive dashboard for exploring popularity, ratings, and rankings.',
    shortDescription:'A responsive movie analytics dashboard for exploring TMDB trends, ratings, and rankings.',
    technicalDescription:null, keyFeatures:[],
    tags:['Next.js','TypeScript','FastAPI','PostgreSQL','Neon','GitHub Actions','TMDB API','Vercel'],
    screenshots:[{src:'/images/cinemetrics.webp',alt:'CineMetrics movie analytics dashboard showing movie statistics and rankings.',label:'Analytics dashboard',width:1280,height:720}],
    detailScreenshot:{src:'/images/cinemetrics-detail.webp',alt:'CineMetrics ranked movie results with popularity and rating data.',label:'Ranked movie results',width:568,height:766},
    websiteUrl:'https://cine-metrics-theta.vercel.app/', websiteLabel:'Live Demo', repositoryUrl:'https://github.com/ragna0112/CineMetrics',credit:null,contribution:null,mood:'cinema',visualMark:'CM',
  },
  {
    id:'panahonph',number:'02',name:'PanahonPH',type:'Philippine Weather Web Application',category:'WEATHER / RESPONSIVE INTERFACE',
    headline:'A little clarity.\nWhatever the weather.',
    description:'PanahonPH is a Philippine weather dashboard that presents current conditions and forecasts through a clean, responsive interface. It supports location search, saved places, and live weather data to make everyday weather information easier to understand.',
    shortDescription:'A Philippine weather dashboard with location search, saved places, and forecasts.',technicalDescription:null,keyFeatures:[],
    tags:['React','TypeScript','Vite','Open-Meteo API','Vercel'],
    screenshots:[{src:'/images/panahonph.webp',alt:'PanahonPH weather dashboard showing Manila conditions and saved locations.',label:'Weather dashboard',width:1280,height:900}],
    websiteUrl:'https://panahon-ph-henna.vercel.app/',websiteLabel:'Live Demo',repositoryUrl:'https://github.com/ragna0112/PanahonPH',credit:null,contribution:null,mood:'weather',
  },
  {
    id:'quakeph',number:'03',name:'QuakePH',type:'Earthquake Monitoring Web Application',category:'EARTHQUAKE MAPS / WEB APPLICATION',
    headline:'Making sense of\na moving world.',
    description:'QuakePH is a Philippine earthquake monitoring dashboard that organizes recent seismic activity into accessible maps, filters, statistics, and event details. It combines automated data collection with an interactive interface for exploring earthquake information.',
    shortDescription:'A Philippine earthquake dashboard combining automated collection with maps and event details.',technicalDescription:null,keyFeatures:[],
    tags:['React','TypeScript','FastAPI','PostgreSQL','Neon','GitHub Actions','Vercel'],
    screenshots:[{src:'/images/quakeph.webp',alt:'QuakePH earthquake dashboard with a Philippines map, event statistics, and filters.',label:'Earthquake dashboard',width:1440,height:2642}],
    websiteUrl:'https://quakeph.vercel.app/',websiteLabel:'Live Demo',repositoryUrl:'https://github.com/ragna0112/QuakePH',credit:null,contribution:null,mood:'seismic',
  },
  {
    id:'lams-docuflow',number:'04',name:'LAMS DocuFlow',type:'Software Engineering Thesis Project',category:'SOFTWARE ENGINEERING / COLLABORATIVE THESIS',
    headline:'A thesis project that digitizes student document requests, status tracking, and administrative queue management.',
    description:'LAMS DocuFlow is a web-based student document request and approval system developed as a Software Engineering thesis project. It provides students with a centralized portal for submitting and tracking document requests, while giving administrators tools for managing queues, request statuses, payments, notifications, and operational records.',
    shortDescription:'A thesis project that digitizes student document requests, status tracking, and administrative queue management.',
    technicalDescription:'The system combines Adaptive Priority Scheduling with Dynamic Queue Management to organize document requests using factors such as urgency, document importance, processing complexity, waiting time, and priority payment. Its event-driven workflow supports request tracking, automated notifications, role-based access, payment verification, administrative controls, reporting, and audit records.',
    keyFeatures:['Student document request portal','Request progress and status tracking','Adaptive Priority Scheduling','Dynamic queue management','Administrative request handling','Priority scoring and queue reordering','Payment receipt submission and verification','Automated status notifications','Role-based student and administrator access','Reports and system analytics','Administrative audit trails'],
    tags:['Python','Flask','JavaScript','HTML','CSS','MySQL','SQLAlchemy','Docker','Nginx','GitHub'],
    screenshots:[
      {src:'/images/lams-docuflow-student-dashboard.webp',alt:'LAMS DocuFlow student dashboard showing document request progress and recent requests.',label:'Student dashboard',width:1518,height:735},
      {src:'/images/lams-docuflow-admin-queue.webp',alt:'LAMS DocuFlow administrator queue showing ranked document requests and priority controls.',label:'Administrator live queue',width:1516,height:746},
    ],
    websiteUrl:'https://lamsdocuflow.com/',websiteLabel:'Visit Website',repositoryUrl:null,
    credit:'Developed as part of a collaborative Software Engineering thesis project.',
    contribution:null, // TODO: Add Rich's verified individual contribution when supplied. Not displayed until set.
    mood:'documents',visualMark:'DF',
  },
];

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuedOn: string;
  dateLabel: string;
  certificate: {
    src: string;
    width: number;
    height: number;
    previewSrc: string;
    previewWidth: number;
    previewHeight: number;
    alt: string;
  };
}
// Labels/dates are the user's selected public wording; proof images retain all original content.
export const credentials: Credential[] = [
  {
    id: 'datacamp-sql', title: 'Associate Data Engineer in SQL — Track Completion', issuer: 'DataCamp', issuedOn: '2026-08-11', dateLabel: 'August 11, 2026',
    certificate: {src: '/credentials/datacamp-associate-data-engineer-sql.webp', width: 1800, height: 1039, previewSrc: '/credentials/datacamp-associate-data-engineer-sql-preview.webp', previewWidth: 480, previewHeight: 277, alt: 'Associate Data Engineer in SQL — Track Completion certificate from DataCamp, awarded to Rich Daniel Lim.'},
  },
  {
    id: 'anthropic-ai-fluency', title: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', issuedOn: '2026-07-24', dateLabel: 'July 24, 2026',
    certificate: {src: '/credentials/anthropic-ai-fluency.webp', width: 1800, height: 1391, previewSrc: '/credentials/anthropic-ai-fluency-preview.webp', previewWidth: 480, previewHeight: 371, alt: 'AI Fluency: Framework & Foundations certificate from Anthropic, awarded to Rich Daniel Lim.'},
  },
  {
    id: 'sap-generative-ai', title: 'SAP Certified Associate – Generative AI Developer', issuer: 'SAP SE', issuedOn: '2026-07-14', dateLabel: 'July 14, 2026',
    certificate: {src: '/credentials/sap-generative-ai-developer.webp', width: 1024, height: 791, previewSrc: '/credentials/sap-generative-ai-developer-preview.webp', previewWidth: 480, previewHeight: 371, alt: 'SAP Certified Associate – Generative AI Developer certificate from SAP SE, awarded to Rich Daniel Lim.'},
  },
  {
    id: 'pmi-project-management', title: 'PMI Project Management Ready', issuer: 'Project Management Institute', issuedOn: '2026-03-04', dateLabel: 'March 4, 2026',
    certificate: {src: '/credentials/pmi-project-management-ready.webp', width: 1800, height: 1391, previewSrc: '/credentials/pmi-project-management-ready-preview.webp', previewWidth: 480, previewHeight: 371, alt: 'PMI Project Management Ready certificate from Project Management Institute, awarded to Rich Daniel Agustin Lim.'},
  },
  {
    id: 'certiport-python', title: 'Information Technology Specialist – Python', issuer: 'Certiport', issuedOn: '2025-07-16', dateLabel: 'July 16, 2025',
    certificate: {src: '/credentials/certiport-python.webp', width: 1800, height: 1391, previewSrc: '/credentials/certiport-python-preview.webp', previewWidth: 480, previewHeight: 371, alt: 'Information Technology Specialist – Python certificate from Certiport, awarded to Rich Daniel Agustin Lim.'},
  },
];
export const resume = {
  url: '/documents/Rich-Daniel-Lim-Resume.pdf',
  filename: 'Rich-Daniel-Lim-Resume.pdf',
  accessibleLabel: 'View Rich Daniel Lim’s full resume',
};

export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  dates: string;
  category: 'Internship' | 'Scholarship / Learning Experience';
}
// Verified titles, organizations and dates only; responsibilities await supplied details.
export const experience: ExperienceEntry[] = [
  {id:'flyrank',title:'Machine Learning Engineering Intern',organization:'FlyRank',startDate:'2026-07',dates:'July 2026 – Present',category:'Internship'},
  {id:'datacamp',title:'DataCamp Scholar',organization:'Data Engineer Pilipinas',startDate:'2026-07',dates:'July 2026 – Present',category:'Scholarship / Learning Experience'},
];
