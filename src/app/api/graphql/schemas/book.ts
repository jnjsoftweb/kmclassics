import { gql } from 'graphql-tag';

export const bookTypeDefs = gql`
  type Book {
    bookId: String!
    bookNum: Int!
    title: String!
    volumes: Int
    chars: Int
    source: String
    titleChinese: String
    author: String
    publishYear: String
    translator: String
    edition: String
    language: String
    physicalInfo: String
    publisher: String
    location: String
    confidenceLevel: String
    abstract: String
    references: String
    volume: String
    translatorInfo: String
    bibliographicInfo: String
    authorInfo: String
    publicationInfo: String
    classification: String
    subject: String
    keywords: String
    ebooks: String
    category: String
    similars: String
  }

  input BookInput {
    bookId: String!
    title: String!
    volumes: Int
    chars: Int
    source: String
    titleChinese: String
    author: String
    publishYear: String
    translator: String
    edition: String
    language: String
    physicalInfo: String
    publisher: String
    location: String
    confidenceLevel: String
    abstract: String
    references: String
    volume: String
    translatorInfo: String
    bibliographicInfo: String
    authorInfo: String
    publicationInfo: String
    classification: String
    subject: String
    keywords: String
    ebooks: String
    category: String
    similars: String
  }

  input BookUpdateInput {
    title: String
    volumes: Int
    chars: Int
    source: String
    titleChinese: String
    author: String
    publishYear: String
    translator: String
    edition: String
    language: String
    physicalInfo: String
    publisher: String
    location: String
    confidenceLevel: String
    abstract: String
    references: String
    volume: String
    translatorInfo: String
    bibliographicInfo: String
    authorInfo: String
    publicationInfo: String
    classification: String
    subject: String
    keywords: String
    ebooks: String
    category: String
    similars: String
  }

  input BookFilterInput {
    bookId: String
    bookNum: Int
    title: String
    author: String
    category: String
    language: String
  }

  type BookPagination {
    data: [Book!]!
    total: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type Query {
    books(page: Int, pageSize: Int, filter: BookFilterInput): BookPagination
    book(bookId: String!): Book
    searchBooks(query: String!): [Book!]!
  }

  type Mutation {
    addBook(input: BookInput!): Book
    updateBook(bookId: String!, input: BookUpdateInput!): Book
    deleteBook(bookId: String!): Boolean
  }
`;
