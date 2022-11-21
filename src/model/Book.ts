import {Author} from "./Author";

class Book {
    public title:string
    public author:Author
    static getAllBooks = ()=>{
         return   [{
            title: 'The Awakening',
            author: 'Kate Chopin',
        },
        {
            title: 'City of Glass',
            author: 'Paul Auster',
        },].map(el=>new Book(el.title,new Author(el.author)))
    }
    constructor(title:string,author:Author){
       this.title = title;
       this.author = author;
       this.author.books.push(this)
    }
}

export default Book