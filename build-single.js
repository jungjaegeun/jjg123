/* -------------------------------------------------------------------------
 * index.html + assets/* 를 파일 하나(dist/index.html)로 합칩니다.
 * 실행: node build-single.js
 * 결과물은 CSS·JS가 모두 안에 들어 있어 이 파일 하나만 올리면 동작합니다.
 * ----------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

let html = read('index.html');
const css = read('assets/css/styles.css');
const jsScreenings = read('assets/js/screenings.js');
const jsMain = read('assets/js/main.js');

/* 치환값을 함수로 넘깁니다. 문자열로 넘기면 코드 안의 `$$`, `$&` 등이
   replace() 의 특수 패턴으로 해석되어 소스가 깨집니다. */
html = html
  .replace(
    '<link rel="stylesheet" href="assets/css/styles.css">',
    () => `<style>\n${css}\n</style>`
  )
  .replace(
    '<script src="assets/js/screenings.js"></script>\n<script src="assets/js/main.js"></script>',
    () => `<script>\n${jsScreenings}\n${jsMain}\n</script>`
  );

if (html.includes('assets/')) {
  console.error('오류: assets/ 참조가 남아 있습니다. 인라인 처리에 실패했습니다.');
  process.exit(1);
}

fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);

/* 홈페이지에서 링크하는 셀프케어 앱도 함께 담습니다 */
fs.cpSync(path.join(root, 'app'), path.join(root, 'dist/app'), { recursive: true });

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`dist/index.html 생성 완료 (${kb} KB)`);
console.log('dist/app/ 복사 완료');
