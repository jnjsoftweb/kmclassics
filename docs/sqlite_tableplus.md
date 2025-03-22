-- ALTER TABLE ContentTotal RENAME TO Content;

-- ALTER TABLE Content RENAME TO MC_00008;
-- UPDATE MC_00008 SET bookId = 'MC_00008';
-- SELECT * FROM MC_00008 WHERE path='1,13' and volumeNum=1;
-- SELECT * FROM MC_00008 WHERE bookId = MC_00001;
-- SELECT * FROM MC_00008 WHERE level='A';

-- UPDATE MC_00008 SET bookId = 'MC_00115' WHERE contentId >= 34041 and contentId < 34810; 
-- SELECT * FROM MC_00008 WHERE bookId ='MC_00115';

-- UPDATE MC_00008 SET bookId = 'MC_00000' WHERE contentId >= 34810;


-- MC_00008 테이블 생성 (Content 테이블과 동일한 구조)
-- CREATE TABLE MC_00008 AS SELECT * FROM Content WHERE 0;

-- -- Content 테이블에서 bookId가 'MC_00008'인 모든 행을 MC_00008 테이블에 삽입
-- INSERT INTO MC_00008
-- SELECT * FROM Content 
-- WHERE bookId = 'MC_00008';



-- SELECT * FROM Content WHERE bookId = 'MC_00135' and sectId = 1;

-- SELECT * FROM MC_00000 WHERE volumeNum = 1 and sectId = 1;
SELECT * FROM Content WHERE contentId >= 503536 LIMIT 20

-- SELECT * FROM Content WHERE contentId >= 58143 LIMIT 20
-- SELECT min(contentId), max(contentId) FROM MC_00004;

-- SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '演小天地問答';
-- SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '鈍翁先生演小天地問答 卷之一';
-- SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese like '%黃帝內經素問 卷之一%';
-- SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '攷事撮要';

-- SELECT contentId, bookId, volumeNum, sectId, chinese FROM Content WHERE chinese like '%卷一百三%';


-- SELECT min(contentId), max(contentId) FROM Content WHERE bookId = 'MC_00222';
-- SELECT min(contentId), max(contentId)  FROM MC_00000 WHERE bookId = 'MC_00222';


-- UPDATE MC_00135 SET bookId = 'MC_00142' WHERE contentId >= 174837 AND contentId < 420830;
-- UPDATE MC_00134 SET bookId = 'MC_00143' WHERE contentId >= 176600 AND contentId < 397488;

-- CREATE TABLE IF NOT EXISTS MC_00143 AS SELECT * FROM MC_00000 WHERE 0;

-- INSERT INTO MC_00143 SELECT * FROM MC_00134 WHERE bookId = 'MC_00143'