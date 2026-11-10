// Only main navigation sections are numbered; interludes retain IDs for scroll tracking.
// Project-card and capability numbers remain independent.
export const sections = [
  {id:'work',label:'Work',number:'01',href:'#work',eyebrow:'SELECTED WORK'},
  {id:'about',label:'About',number:'02',href:'#about',eyebrow:'ABOUT'},
  {id:'credentials',label:'Credentials',number:'03',href:'#credentials',eyebrow:'CREDENTIALS'},
  {id:'experience',label:'Experience',number:'04',href:'#experience',eyebrow:'EXPERIENCE'},
  {id:'game',label:'Hello World',number:null,href:'#game',eyebrow:'INTERACTIVE'},
  {id:'contact',label:'Contact',number:'05',href:'#contact',eyebrow:'CONTACT'},
] as const;
// The game retains its anchor and observer target without a header link.
export const navigationSections=sections.filter(section=>section.number!==null);
export type SectionId=typeof sections[number]['id'];
export const sectionEyebrow=(id:SectionId)=>{const section=sections.find(section=>section.id===id)!;return section.number===null?section.eyebrow:`${section.eyebrow} / ${section.number}`;};
export const isSectionTarget=(id:string)=>id==='home'||sections.some(section=>section.id===id);
