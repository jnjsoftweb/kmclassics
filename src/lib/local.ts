import { findFiles } from 'jnu-abc';

// const appRootPath = process.env.APP_ROOT_PATH;
// const appRootPath = 'C:/JnJ/Developments/Servers/nextjs/kmclassics';
const appRootPath = process.env.APP_ROOT_PATH || '/nas/database/_temp/km-classics';



const findImagePath = (imageId: string) => {
  // const imagePaths = findFiles(`${appRootPath}/public/images`, `${imageId.padStart(4, '0')}_*`);
  const imagePaths = findFiles(`${appRootPath}/files`, `${imageId.padStart(4, '0')}_*`);
  return imagePaths[0].replaceAll('\\', '/').split('/').pop();
};

export { findImagePath };
