// Page-section numbers are independent of project cards and capability item numbers.
export const sections = [
  {id:'work',label:'Work',number:'01',href:'#work',eyebrow:'SELECTED WORK'},
  {id:'about',label:'About',number:'02',href:'#about',eyebrow:'ABOUT'},
  {id:'credentials',label:'Credentials',number:'03',href:'#credentials',eyebrow:'CREDENTIALS'},
  {id:'game',label:'Play',number:'04',href:'#game',eyebrow:'INTERACTIVE'},
  {id:'contact',label:'Contact',number:'05',href:'#contact',eyebrow:'CONTACT'},
] as const;
export type SectionId=typeof sections[number]['id'];
export const sectionEyebrow=(id:SectionId)=>{const section=sections.find(section=>section.id===id)!;return `${section.eyebrow} / ${section.number}`;};
export const isSectionTarget=(id:string)=>id==='home'||sections.some(section=>section.id===id);
