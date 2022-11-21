import Book from "../model/Book";
import {BaseContext} from "@apollo/server";
import {IResolvers} from "@graphql-tools/utils"
import {Author} from "../model/Author";

const resolvers:IResolvers<any, BaseContext, Record<string, any>, any> = {
    Query: {
        authors: () => Author.getAllAuthors(),
        books: () => Book.getAllBooks(),
        booksByName: (name:string) => Book.getAllBooks().find(book=>book.title == name),
    },
};

export {resolvers}