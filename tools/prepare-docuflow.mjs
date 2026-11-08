// Originals are preserved; only optimized copies are cropped and encoded.
import sharp from 'sharp';
const images=[
  {source:'student-dashboard-original.png',output:'lams-docuflow-student-dashboard.webp',crop:{left:10,top:11,width:1518,height:735}},
  {source:'admin-queue-original.png',output:'lams-docuflow-admin-queue.webp',crop:{left:10,top:38,width:1516,height:746}},
];
for(const image of images){
  await sharp(`source-assets/docuflow/${image.source}`).extract(image.crop).webp({quality:92,effort:6}).toFile(`public/images/${image.output}`);
}
