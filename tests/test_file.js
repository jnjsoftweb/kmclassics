import { findFiles } from 'jnu-abc';

// const appRootPath = process.env.APP_ROOT_PATH;
const appRootPath = 'C:/JnJ/Developments/Servers/nextjs/kmclassics';

const findImagePath = (imageId) => {
  const imagePaths = findFiles(`${appRootPath}/public/images`, `${imageId.padStart(4, '0')}_*`);
  return imagePaths[0].replaceAll('\\', '/').split('/').pop();
};

export { findImagePath };

// const paths = findFiles(`C:/JnJ/Developments/Servers/nextjs/kmclassics/public/images`, `1600_*`);

// console.log(`paths: ${paths}`);

const imagePath = findImagePath('1600');
console.log(`imagePath: ${imagePath}`);
