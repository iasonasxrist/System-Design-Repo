
class Book {
    constructor(id, Title, Author, Pages) {
        this.id = id;
        this.Title = Title;
        this.Author = Author;
        this.Pages = Pages;
    }

    toDBFormat() {
        return {
            id: this.id,
            Title: this.Title,
            Author: this.Author,
            Pages: this.Pages
        };
    }

    static fromDBFormat(item) {
        return new Book(item.id, item.Title, item.Author, item.Pages);
    }
}

module.exports = Book;