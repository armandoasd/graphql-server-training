const generatedTypedef = `#graphql
type Author {
  name: String
  books: [Book]
}
type Book {
  title: String
  author: Author
}
type Query {
  authors: [Author]
  books: [Book]
  booksByName(name:String): Book
}
`;

export {generatedTypedef}