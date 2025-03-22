## scraping 필요 도서
- MC_00056        醫方類聚
html이 56_201.html만 있음

https://mediclassics.kr/books/56
※ 이 서적은 번역문 없이 원문만 제공하며 총 266권 중, 권1-59권, 201권을 서비스 중입니다.
※ 국내에 소장된 조선간본 201권은 번역을 진행하였습니다. (한독의약박물관 소장)


- MC_00285        脈義簡摩

## 전자책 목록
MC_00227        고전한의번역서 전자책 (eBook)

===
처리됨

SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese like '%醫方類聚卷之二百一%';
268690	MC_00054	201	1

---

MC_00121        演小天地問答
MC_00162        黃帝內經素問
MC_00193        四庫全書總目提要ㆍ醫家類
MC_00199        攷事撮要
MC_00214        新編醫學正傳

---

MC_00285        脈義簡摩
MC_00227        고전한의번역서 전자책 (eBook)

===


- MC_00121	演小天地問答: 243323	MC_00172  2
- MC_00162	黃帝內經素問: 503536	MC_00218  volumeNum 82
- MC_00193 	四庫全書總目提要ㆍ醫家類: 169026	MC_00278  4
- MC_00199	攷事撮要: 55703	MC_00200  2
- MC_00214	新編醫學正傳: 221939	MC_00041  2




SELECT contentId, bookId FROM Content WHERE chinese = '新編醫學正傳 卷之一';	221939	MC_00041				MC_00214	新編醫學正傳
SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '鈍翁先生演小天地問答 卷之一';	243323	MC_00172	2	1		MC_00121	演小天地問答
SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '黃帝內經素問 卷之一';	503536	MC_00218	82	1		MC_00162	黃帝內經素問
						MC_00056	醫方類聚
SELECT contentId, bookId, volumeNum, sectId FROM Content WHERE chinese = '攷事撮要';	55703	MC_00200	2	1		MC_00199	攷事撮要
SELECT contentId, bookId, volumeNum, sectId, chinese FROM Content WHERE chinese like '%卷一百三%';	169026	MC_00278	4	1	欽定四庫全書總目 卷一百三	MC_00193 	四庫全書總目提要ㆍ醫家類