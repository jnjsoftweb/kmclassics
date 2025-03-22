[/api/graphql](http://localhost:3000/api/graphql)


# 모든 책 조회 (페이지네이션)
query GetBooks {
  books(page: 1, pageSize: 10) {
    data {
      bookId
      title
      author
    }
    total
    totalPages
    currentPage
  }
}

# 단일 책 조회
query GetBook {
  book(bookId: "book123") {
    bookId
    title
    author
    abstract
  }
}

# 책 검색
query SearchBooks {
  searchBooks(searchTerm: "역사", page: 1, pageSize: 10) {
    data {
      bookId
      title
      author
    }
    total
  }
}

# 책 생성
mutation CreateBook {
  createBook(input: {
    bookId: "newbook123",
    title: "새로운 책",
    author: "작가 이름"
  }) {
    bookId
    title
  }
}

# 책 수정
mutation UpdateBook {
  updateBook(
    bookId: "book123",
    input: {
      title: "수정된 제목",
      abstract: "새로운 요약 내용"
    }
  ) {
    bookId
    title
    abstract
  }
}

# 책 삭제
mutation DeleteBook {
  deleteBook(bookId: "book123")
}
