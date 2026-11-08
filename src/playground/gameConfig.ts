import {projects} from '../projects';
const verified=[...new Set(projects.flatMap(project=>project.tags))];
const preferred=['React','TypeScript','Python','Flask','MySQL','SQLAlchemy','FastAPI','PostgreSQL','Docker','GitHub'];
const skills=[...new Set([...preferred.filter(skill=>verified.includes(skill)),...verified])];
const positions=[[.16,.18],[.43,.13],[.76,.18],[.88,.43],[.72,.80],[.43,.86],[.15,.78],[.28,.45],[.57,.40],[.85,.70]];
export const GAME_LETTERS=[...'HELLOWORLD'].map((letter,index)=>({letter,skill:skills[index%skills.length],u:positions[index][0],v:positions[index][1]}));
export const GAME={playerRadius:8,letterRadius:14,padding:30,dprLimit:2,nominalTravelSeconds:32} as const;
