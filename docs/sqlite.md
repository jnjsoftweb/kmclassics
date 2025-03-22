
## db 경로

```
C:\JnJ-soft\Projects\external\km-classics\sqlite\km-classics.db
```


## json 데이터 경로

C:\JnJ-soft\Projects\external\km-classics\json\allBookInfos.json

## tables

> `Book`

column_name	data_type	is_nullable	column_default	foreign_key
similars	TEXT	YES	NULL	
bookId	TEXT	NO	NULL	
bookNum	INTEGER	NO	NULL	
title	TEXT	NO	NULL	
volumes	INTEGER	NO	NULL	
chars	INTEGER	NO	NULL	
source	TEXT	YES	NULL	
titleChinese	TEXT	YES	NULL	
author	TEXT	YES	NULL	
publishYear	TEXT	YES	NULL	
translator	TEXT	YES	NULL	
edition	TEXT	YES	NULL	
language	TEXT	YES	NULL	
physicalInfo	TEXT	YES	NULL	
location	TEXT	YES	NULL	
ebooks	TEXT	YES	NULL	
abstract	TEXT	YES	NULL	
translatorInfo	TEXT	YES	NULL	
category	TEXT	YES	NULL

> `Content`

column_name	data_type	is_nullable	column_default	foreign_key
bookId	TEXT	YES	NULL	Book(bookId)
chinese	TEXT	YES	NULL	
chineseKo	TEXT	YES	NULL	
contentId	INTEGER	NO	NULL	
depth	TEXT	YES	NULL	
english	TEXT	YES	NULL	
korean	TEXT	YES	NULL	
level	TEXT	YES	NULL	
path	TEXT	YES	NULL	
sectId	INTEGER	NO	NULL	
sectNum	TEXT	YES	NULL	
volumeNum	INTEGER	NO	NULL	


===

SQLite에서 Content 테이블과 동일한 구조의 MC_00008 테이블을 생성하고, Content 테이블에서 bookId가 'MC_00008'인 모든 행을 새 테이블에 삽입하는 쿼리문은 다음과 같습니다:

```sql
-- MC_00008 테이블 생성 (Content 테이블과 동일한 구조)
CREATE TABLE MC_00008 AS 
SELECT * FROM Content WHERE 0;

-- Content 테이블에서 bookId가 'MC_00008'인 모든 행을 MC_00008 테이블에 삽입
INSERT INTO MC_00008
SELECT * FROM Content 
WHERE bookId = 'MC_00008';
```

이 쿼리는 다음과 같은 작업을 수행합니다:

1. 첫 번째 쿼리 (`CREATE TABLE AS SELECT`)는 Content 테이블과 동일한 구조를 가진 MC_00008 테이블을 생성합니다. `WHERE 0` 조건을 사용하여 데이터는 복사하지 않고 구조만 복사합니다.

2. 두 번째 쿼리 (`INSERT INTO SELECT`)는 Content 테이블에서 bookId가 'MC_00008'인 모든 행을 새로 생성된 MC_00008 테이블에 삽입합니다.

이 방법을 사용하면 Content 테이블의 구조(컬럼 이름, 데이터 타입 등)를 정확히 알지 않아도 동일한 구조의 테이블을 생성하고 데이터를 복사할 수 있습니다.

만약 테이블이 이미 존재한다면 먼저 삭제해야 할 수도 있습니다:

```sql
-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS MC_00008;

-- 위의 쿼리 실행
CREATE TABLE MC_00008 AS 
SELECT * FROM Content WHERE 0;

INSERT INTO MC_00008
SELECT * FROM Content 
WHERE bookId = 'MC_00008';
```
