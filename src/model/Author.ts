import Book from "./Book";

class Author {
    public name: string
    public books: Book[]

    static getAllAuthors = () => {
        return Book.getAllBooks().map(book=>{
            return book.author
        })
    }

    constructor(name:string) {
        this.name = name
        this.books = []
    }
}

export {Author}